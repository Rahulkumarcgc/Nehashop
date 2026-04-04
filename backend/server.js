const express = require('express');
const cors = require('cors');
require('dotenv').config();

process.env.DATABASE_URL = 'postgresql://postgres:Chhena%4032919@db.vgnfcoqenvtdkwrgyihq.supabase.co:5432/postgres'

const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: '*' // baad mein Vercel URL se replace karenge
}));
app.use(express.json());

// Routes -------------

// 1. Fetch All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { numericId: 'asc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// 2. Fetch Single Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// 3. Create Order (Checkout Flow)
app.post('/api/orders', async (req, res) => {
  try {
    const { clerkUserId, items, totalAmount, paymentMethod, utrNumber, shipping } = req.body;

    const newOrder = await prisma.order.create({
      data: {
        clerkUserId: clerkUserId || "guest",
        totalAmount,
        paymentMethod,
        utrNumber: paymentMethod === 'upi' ? utrNumber : null,
        status: paymentMethod === 'upi' ? 'Pending Verification' : 'Processing',
        shippingName: shipping.name,
        shippingPhone: shipping.phone,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingZip: shipping.zip,
        items: {
          create: items.map(item => ({
            productId: item.dbId,
            quantity: item.qty,
            priceAtTime: item.price
          }))
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Checkout failed:', error);
    res.status(500).json({ success: false, error: 'Failed to process order sequence' });
  }
});

// 4. Fetch User Orders
app.get('/api/orders/:clerkUserId', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { clerkUserId: req.params.clerkUserId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// 5. Cloud Cart Synchronization
app.post('/api/cart/sync', async (req, res) => {
  const { clerkUserId, items } = req.body;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { clerkUserId } });

      if (items && items.length > 0) {
        await tx.cartItem.createMany({
          data: items.map(i => ({
            clerkUserId,
            productId: i.dbId || String(i.id),
            quantity: i.qty || i.quantity || 1
          }))
        });
      }
    });

    res.json({ success: true, message: 'Cloud Cart synced.' });
  } catch (error) {
    console.error('Cart sync error:', error);
    res.status(500).json({ error: 'Failed to sync cart' });
  }
});

app.get('/api/cart/:clerkUserId', async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { clerkUserId: req.params.clerkUserId },
      include: { product: true }
    });
    res.json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch cloud cart' });
  }
});

// --- User Management ---

app.post('/api/users/sync', async (req, res) => {
  try {
    const { clerkUserId, email, firstName, lastName } = req.body;

    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: { email, firstName, lastName },
      create: { clerkUserId, email, firstName, lastName }
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

app.get('/api/users/:clerkUserId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: req.params.clerkUserId },
      include: { detail: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

app.put('/api/users/:clerkUserId/details', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const detailsData = req.body;

    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updatedDetails = await prisma.userDetail.upsert({
      where: { userId: user.id },
      update: detailsData,
      create: { userId: user.id, ...detailsData }
    });

    res.json({ success: true, detail: updatedDetails });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ error: 'Failed to update user details' });
  }
});

// --- Coupon Management ---

app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) return res.status(404).json({ valid: false, error: 'Invalid coupon code' });
    if (!coupon.isActive) return res.status(400).json({ valid: false, error: 'Coupon is inactive' });

    const now = new Date();
    if (coupon.validFrom > now) return res.status(400).json({ valid: false, error: 'Coupon is not yet active' });
    if (coupon.validUntil && coupon.validUntil < now) return res.status(400).json({ valid: false, error: 'Coupon has expired' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ valid: false, error: 'Coupon usage limit reached' });
    }
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({ valid: false, error: `Minimum order amount of ₹${coupon.minOrderAmount} required` });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = cartTotal * (coupon.discountValue / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({ valid: true, discount, couponId: coupon.id, discountType: coupon.discountType, discountValue: coupon.discountValue });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// --- Wishlist Management ---

app.get('/api/wishlist/:clerkUserId', async (req, res) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { clerkUserId: req.params.clerkUserId },
      include: { product: true }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

app.post('/api/wishlist/sync', async (req, res) => {
  const { clerkUserId, items } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.wishlistItem.deleteMany({ where: { clerkUserId } });
      if (items && items.length > 0) {
        await tx.wishlistItem.createMany({
          data: items.map(i => ({
            clerkUserId,
            productId: i.dbId || String(i.id)
          }))
        });
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync wishlist' });
  }
});

// --- Reviews Management ---

app.get('/api/products/:productId/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { product: { numericId: parseInt(req.params.productId) } },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { clerkUserId, productId, rating, comment } = req.body;
    const product = await prisma.product.findUnique({
      where: { numericId: parseInt(productId) }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const review = await prisma.review.create({
      data: {
        clerkUserId,
        productId: product.id,
        rating,
        comment
      },
      include: { user: { select: { firstName: true, lastName: true } } }
    });
    res.json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 NehaShop Backend running on http://localhost:${PORT}`);
});
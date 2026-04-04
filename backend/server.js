const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: '*' // later you can replace with your Vercel frontend URL
}));

app.use(express.json());


// ---------------- PRODUCTS ----------------

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { numericId: 'asc' }
    });

    res.json(products);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});


// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});


// ---------------- ORDERS ----------------

// Create order
app.post('/api/orders', async (req, res) => {

  try {

    const {
      clerkUserId,
      items,
      totalAmount,
      paymentMethod,
      utrNumber,
      shipping
    } = req.body;

    const order = await prisma.order.create({

      data: {

        clerkUserId: clerkUserId || "guest",

        totalAmount,

        paymentMethod,

        utrNumber:
          paymentMethod === "upi"
            ? utrNumber
            : null,

        status:
          paymentMethod === "upi"
            ? "Pending Verification"
            : "Processing",

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

    res.status(201).json({
      success: true,
      order
    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: "Order failed"
    });

  }

});


// get user orders
app.get('/api/orders/:clerkUserId', async (req, res) => {

  try {

    const orders = await prisma.order.findMany({

      where: {
        clerkUserId: req.params.clerkUserId
      },

      include: {
        items: {
          include: {
            product: true
          }
        }
      },

      orderBy: {
        createdAt: 'desc'
      }

    });

    res.json(orders);

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to fetch orders"
    });

  }

});


// ---------------- CART ----------------

// sync cart
app.post('/api/cart/sync', async (req, res) => {

  const { clerkUserId, items } = req.body;

  try {

    await prisma.$transaction(async (tx) => {

      await tx.cartItem.deleteMany({
        where: { clerkUserId }
      });

      if (items?.length) {

        await tx.cartItem.createMany({

          data: items.map(item => ({

            clerkUserId,

            productId: item.dbId || String(item.id),

            quantity: item.qty || item.quantity || 1

          }))

        });

      }

    });

    res.json({
      success: true
    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Cart sync failed"
    });

  }

});


// get cart
app.get('/api/cart/:clerkUserId', async (req, res) => {

  try {

    const cart = await prisma.cartItem.findMany({

      where: {
        clerkUserId: req.params.clerkUserId
      },

      include: {
        product: true
      }

    });

    res.json(cart);

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to fetch cart"
    });

  }

});


// ---------------- USER ----------------

// sync user
app.post('/api/users/sync', async (req, res) => {

  try {

    const {
      clerkUserId,
      email,
      firstName,
      lastName
    } = req.body;

    const user = await prisma.user.upsert({

      where: {
        clerkUserId
      },

      update: {
        email,
        firstName,
        lastName
      },

      create: {
        clerkUserId,
        email,
        firstName,
        lastName
      }

    });

    res.json({
      success: true,
      user
    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      error: "User sync failed"
    });

  }

});


// ---------------- WISHLIST ----------------

// get wishlist
app.get('/api/wishlist/:clerkUserId', async (req, res) => {

  try {

    const wishlist = await prisma.wishlistItem.findMany({

      where: {
        clerkUserId: req.params.clerkUserId
      },

      include: {
        product: true
      }

    });

    res.json(wishlist);

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Wishlist fetch failed"
    });

  }

});


// sync wishlist
app.post('/api/wishlist/sync', async (req, res) => {

  const { clerkUserId, items } = req.body;

  try {

    await prisma.$transaction(async (tx) => {

      await tx.wishlistItem.deleteMany({
        where: { clerkUserId }
      });

      if (items?.length) {

        await tx.wishlistItem.createMany({

          data: items.map(item => ({

            clerkUserId,

            productId:
              item.dbId ||
              String(item.id)

          }))

        });

      }

    });

    res.json({
      success: true
    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Wishlist sync failed"
    });

  }

});


// ---------------- REVIEWS ----------------

// get reviews
app.get('/api/products/:productId/reviews', async (req, res) => {

  try {

    const reviews = await prisma.review.findMany({

      where: {
        product: {
          numericId: parseInt(req.params.productId)
        }
      },

      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },

      orderBy: {
        createdAt: 'desc'
      }

    });

    res.json(reviews);

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Review fetch failed"
    });

  }

});


// create review
app.post('/api/reviews', async (req, res) => {

  try {

    const {
      clerkUserId,
      productId,
      rating,
      comment
    } = req.body;

    const product = await prisma.product.findUnique({

      where: {
        numericId: parseInt(productId)
      }

    });

    if (!product) {

      return res.status(404).json({
        error: "Product not found"
      });

    }

    const review = await prisma.review.create({

      data: {

        clerkUserId,

        productId: product.id,

        rating,

        comment

      },

      include: {

        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }

      }

    });

    res.json({
      success: true,
      review
    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Review failed"
    });

  }

});


// ---------------- SERVER ----------------

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: "*"
}));

app.use(express.json());


// test route
app.get("/", (req, res) => {
  res.send("Backend working ✅");
});


// ---------------- PRODUCTS ----------------

app.get("/api/products", async (req, res) => {

  try {

    const products = await prisma.product.findMany({
      orderBy: { numericId: "asc" }
    });

    res.json(products);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: String(error)
    });
  }

});


app.get("/api/products/:id", async (req, res) => {

  try {

    const product = await prisma.product.findUnique({

      where: {
        id: req.params.id
      }

    });

    if (!product) {

      return res.status(404).json({
        error: "Product not found"
      });

    }

    res.json(product);

  }

  catch (error) {

    res.status(500).json({
      error: "Failed to fetch product"
    });

  }

});


// ---------------- ORDERS ----------------

app.post("/api/orders", async (req, res) => {

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

    res.json({
      success: true,
      order
    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Order failed"
    });

  }

});


app.get("/api/orders/:clerkUserId", async (req, res) => {

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
        createdAt: "desc"
      }

    });

    res.json(orders);

  }

  catch (error) {

    res.status(500).json({
      error: "Orders fetch failed"
    });

  }

});


// ---------------- CART ----------------

app.post("/api/cart/sync", async (req, res) => {

  const { clerkUserId, items } = req.body;

  try {

    await prisma.$transaction(async (tx) => {

      await tx.cartItem.deleteMany({
        where: { clerkUserId }
      });

      if (items?.length) {

        await tx.cartItem.createMany({

          data: items.map(i => ({

            clerkUserId,

            productId: i.dbId,

            quantity: i.qty || 1

          }))

        });

      }

    });

    res.json({
      success: true
    });

  }

  catch (error) {

    res.status(500).json({
      error: "Cart sync failed"
    });

  }

});


app.get("/api/cart/:clerkUserId", async (req, res) => {

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

    res.status(500).json({
      error: "Cart fetch failed"
    });

  }

});


// ---------------- USER ----------------

app.post("/api/users/sync", async (req, res) => {

  try {

    const {
      clerkUserId,
      email,
      firstName,
      lastName
    } = req.body;

    const user = await prisma.user.upsert({

      where: { clerkUserId },

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

    res.status(500).json({
      error: "User sync failed"
    });

  }

});


// ---------------- COUPONS ----------------

app.get("/api/coupons", async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(coupons);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

app.post("/api/coupons/validate", async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) return res.status(400).json({ valid: false, error: "No coupon code provided" });

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) return res.json({ valid: false, error: "Invalid coupon code" });
    if (!coupon.isActive) return res.json({ valid: false, error: "This coupon is no longer active" });

    const now = new Date();
    if (coupon.validUntil && now > new Date(coupon.validUntil))
      return res.json({ valid: false, error: "This coupon has expired" });
    if (coupon.validFrom && now < new Date(coupon.validFrom))
      return res.json({ valid: false, error: "This coupon is not valid yet" });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return res.json({ valid: false, error: "This coupon has reached its usage limit" });
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount)
      return res.json({ valid: false, error: `Minimum order of ₹${coupon.minOrderAmount} required` });

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = Math.round((cartTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, cartTotal);

    res.json({
      valid: true,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ valid: false, error: "Server error validating coupon" });
  }
});


// ---------------- WISHLIST ----------------

app.get("/api/wishlist/:clerkUserId", async (req, res) => {
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
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Wishlist fetch failed"
    });
  }
});

app.post("/api/wishlist/sync", async (req, res) => {
  const { clerkUserId, items } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.wishlistItem.deleteMany({
        where: { clerkUserId }
      });
      if (items?.length) {
        await tx.wishlistItem.createMany({
          data: items.map(i => ({
            clerkUserId,
            productId: i.dbId
          }))
        });
      }
    });
    res.json({
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Wishlist sync failed"
    });
  }
});


// ---------------- REVIEWS ----------------

app.get("/api/products/:productId/reviews", async (req, res) => {
  try {
    const { productId } = req.params;
    let product;
    if (/^\d+$/.test(productId)) {
      product = await prisma.product.findUnique({
        where: { numericId: parseInt(productId) }
      });
    } else {
      product = await prisma.product.findUnique({
        where: { id: productId }
      });
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      include: {
        user: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(reviews);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const { clerkUserId, productId, rating, comment } = req.body;
    let product;
    if (typeof productId === "number" || /^\d+$/.test(String(productId))) {
      product = await prisma.product.findUnique({
        where: { numericId: parseInt(productId) }
      });
    } else {
      product = await prisma.product.findUnique({
        where: { id: productId }
      });
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let userRecord = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    if (!userRecord) {
      userRecord = await prisma.user.create({
        data: {
          clerkUserId,
          email: `${clerkUserId}@placeholder.com`,
          firstName: "Anonymous",
          lastName: ""
        }
      });
    }

    const review = await prisma.review.create({
      data: {
        clerkUserId,
        productId: product.id,
        rating: parseInt(rating),
        comment,
      },
      include: {
        user: true
      }
    });

    // Update product rating average
    const allReviews = await prisma.review.findMany({
      where: { productId: product.id }
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.product.update({
      where: { id: product.id },
      data: { rating: parseFloat(avgRating.toFixed(1)) }
    });

    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to submit review" });
  }
});


// ---------------- SERVER ----------------

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    "Server running on port",
    PORT
  );

});
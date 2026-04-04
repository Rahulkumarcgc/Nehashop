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
      error: "Failed to fetch products"
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


// ---------------- SERVER ----------------

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    "Server running on port",
    PORT
  );

});
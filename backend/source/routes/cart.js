// routes/cart.js
import express from "express";
import GuestSession from "../models/GuestSession.js";
import Product from "../models/Product.js";
import guestAuth from "../middleware/guestAuth.js";

const router = express.Router();

// All routes use guest authentication
router.use(guestAuth);

// GET /api/cart - Get cart contents
router.get("/", async (req, res) => {
  try {
    const session = await GuestSession.findOne({
      sessionId: req.sessionId,
    }).populate("cart.product");
    res.json(session.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cart - Add item to cart
router.post("/", async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const session = await GuestSession.findOne({ sessionId: req.sessionId });
    const existingItem = session.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      session.cart.push({ product: productId, quantity });
    }

    await session.save();
    await session.populate("cart.product");

    res.json(session.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/cart/:productId - Update cart item quantity
router.put("/:productId", async (req, res) => {
  try {
    const { quantity } = req.body;
    const session = await GuestSession.findOne({ sessionId: req.sessionId });

    const item = session.cart.find(
      (item) => item.product.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    if (quantity <= 0) {
      session.cart = session.cart.filter(
        (item) => item.product.toString() !== req.params.productId
      );
    } else {
      item.quantity = quantity;
    }

    await session.save();
    await session.populate("cart.product");

    res.json(session.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cart/:productId - Remove item from cart
router.delete("/:productId", async (req, res) => {
  try {
    const session = await GuestSession.findOne({ sessionId: req.sessionId });

    session.cart = session.cart.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await session.save();
    await session.populate("cart.product");

    res.json(session.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete("/", async (req, res) => {
  try {
    const session = await GuestSession.findOne({ sessionId: req.sessionId });
    session.cart = [];
    await session.save();
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

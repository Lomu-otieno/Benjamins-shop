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
    const session = await GuestSession.findOne(
      { sessionId: req.sessionId },
      { cart: 1 }
    ).populate("cart.product", "name price images stock"); // Only needed fields

    res.json(session?.cart || []);
  } catch (error) {
    console.error("Cart get error:", error);
    res.json([]); // Never fail - return empty array
  }
});

// POST /api/cart - Add item to cart
router.post("/", async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Quick existence check without full product data
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Use MongoDB update operations instead of find-save pattern
    const session = await GuestSession.findOneAndUpdate(
      {
        sessionId: req.sessionId,
        "cart.product": productId,
      },
      {
        $inc: { "cart.$.quantity": quantity },
      },
      { new: true }
    );

    let updatedSession;
    if (!session) {
      // Item doesn't exist, add new one
      updatedSession = await GuestSession.findOneAndUpdate(
        { sessionId: req.sessionId },
        {
          $push: { cart: { product: productId, quantity } },
        },
        { new: true }
      );
    } else {
      updatedSession = session;
    }

    // Return populated cart
    const populatedSession = await GuestSession.findOne(
      { sessionId: req.sessionId },
      { cart: 1 }
    ).populate("cart.product", "name price images");

    res.json(populatedSession.cart);
  } catch (error) {
    console.error("Cart add error:", error);
    res.status(500).json({ error: "Failed to add to cart" });
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

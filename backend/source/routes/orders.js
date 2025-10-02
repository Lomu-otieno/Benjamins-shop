// routes/orders.js
import express from "express";
import Order from "../models/Order.js";
import GuestSession from "../models/GuestSession.js";
import guestAuth from "../middleware/guestAuth.js";

const router = express.Router();

// POST /api/orders - Create new order
router.post("/", guestAuth, async (req, res) => {
  try {
    const { customerInfo, shippingAddress, paymentMethod } = req.body;

    // Get current cart
    const session = await GuestSession.findOne({
      sessionId: req.sessionId,
    }).populate("cart.product");

    if (!session.cart.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate total
    const items = session.cart.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const totalAmount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Create order
    const order = new Order({
      guestSessionId: req.sessionId,
      customerInfo,
      shippingAddress,
      items,
      totalAmount,
    });

    await order.save();

    // Clear cart after successful order
    session.cart = [];
    await session.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:orderNumber - Get order by order number
router.get("/:orderNumber", async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/guest/:sessionId - Get orders by guest session
router.get("/guest/:sessionId", async (req, res) => {
  try {
    const orders = await Order.find({ guestSessionId: req.params.sessionId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

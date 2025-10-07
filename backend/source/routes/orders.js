// routes/orders.js - OPTIMIZED VERSION
import express from "express";
import Order from "../models/Order.js";
import GuestSession from "../models/GuestSession.js";
import Product from "../models/Product.js";
import guestAuth from "../middleware/guestAuth.js";

const router = express.Router();

// POST /api/orders - Create new order (OPTIMIZED)
router.post("/", guestAuth, async (req, res) => {
  try {
    const { customerInfo, shippingAddress } = req.body;

    // Get cart with minimal population - only needed fields
    const session = await GuestSession.findOne(
      { sessionId: req.sessionId },
      { cart: 1 } // Only get cart field
    ).populate("cart.product", "price name"); // Only get price and name

    if (!session || !session.cart.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate total - much faster with minimal data
    const items = session.cart.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
      productName: item.product.name, // Store product name for display
    }));

    const totalAmount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Create order with minimal operations
    const order = new Order({
      guestSessionId: req.sessionId,
      customerInfo,
      shippingAddress,
      items,
      totalAmount,
    });

    await order.save();

    // Clear cart - don't repopulate, just clear
    await GuestSession.updateOne(
      { sessionId: req.sessionId },
      { $set: { cart: [] } }
    );

    // Return order without populating (faster)
    res.status(201).json({
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      items: order.items,
      customerInfo: order.customerInfo,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET /api/orders/:orderNumber - Get order by order number (OPTIMIZED)
router.get("/:orderNumber", async (req, res) => {
  try {
    const order = await Order.findOne(
      { orderNumber: req.params.orderNumber },
      {
        orderNumber: 1,
        totalAmount: 1,
        items: 1,
        customerInfo: 1,
        shippingAddress: 1,
        createdAt: 1,
        status: 1,
      }
    ).populate("items.product", "name images"); // Only get name and images

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Order fetch error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// GET /api/orders/guest/:sessionId - Get orders by guest session (OPTIMIZED)
router.get("/guest/:sessionId", async (req, res) => {
  try {
    const orders = await Order.find(
      { guestSessionId: req.params.sessionId },
      {
        orderNumber: 1,
        totalAmount: 1,
        items: 1,
        customerInfo: 1,
        createdAt: 1,
        status: 1,
      }
    )
      .populate("items.product", "name images") // Minimal population
      .sort({ createdAt: -1 })
      .limit(10) // Limit results
      .lean(); // Faster plain objects

    res.json(orders);
  } catch (error) {
    console.error("Guest orders fetch error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;

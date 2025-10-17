// routes/orders.js - OPTIMIZED VERSION WITH ADMIN ENDPOINTS
import express from "express";
import Order from "../models/Order.js";
import GuestSession from "../models/GuestSession.js";
import Product from "../models/Product.js";
import guestAuth from "../middleware/guestAuth.js";
import adminAuth from "../middleware/adminAuth.js"; // Make sure you have this middleware

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

// ================= ADMIN ROUTES ================= //

// GET /api/orders/admin/all - Get all orders (Admin only)
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    // Status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Search filter (order number or customer info)
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customerInfo.name": { $regex: search, $options: "i" } },
        { "customerInfo.email": { $regex: search, $options: "i" } },
        { "customerInfo.phone": { $regex: search, $options: "i" } },
      ];
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get orders with pagination
    const orders = await Order.find(filter)
      .select({
        orderNumber: 1,
        totalAmount: 1,
        items: 1,
        customerInfo: 1,
        shippingAddress: 1,
        status: 1,
        createdAt: 1,
        guestSessionId: 1,
      })
      .populate("items.product", "name images price") // Include price for admin
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Order.countDocuments(filter);

    // Calculate statistics
    const totalRevenue = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const statusCounts = await Order.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      statistics: {
        totalRevenue: totalRevenue[0]?.total || 0,
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/admin/stats - Get order statistics (Admin only)
router.get("/admin/stats", adminAuth, async (req, res) => {
  try {
    const { period = "all" } = req.query; // all, today, week, month, year

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "today":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.setHours(0, 0, 0, 0)),
            $lte: new Date(now.setHours(23, 59, 59, 999)),
          },
        };
        break;
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case "month":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lte: new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            ),
          },
        };
        break;
      case "year":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
          },
        };
        break;
    }

    const stats = await Order.aggregate([
      { $match: dateFilter },
      {
        $facet: {
          totalOrders: [{ $count: "count" }],
          totalRevenue: [
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ],
          statusBreakdown: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          recentOrders: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                orderNumber: 1,
                totalAmount: 1,
                status: 1,
                createdAt: 1,
                "customerInfo.name": 1,
              },
            },
          ],
        },
      },
    ]);

    res.json({
      period,
      totalOrders: stats[0].totalOrders[0]?.count || 0,
      totalRevenue: stats[0].totalRevenue[0]?.total || 0,
      statusBreakdown: stats[0].statusBreakdown,
      recentOrders: stats[0].recentOrders,
    });
  } catch (error) {
    console.error("Admin stats fetch error:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// GET /api/orders/admin/:orderId - Get specific order details (Admin only)
router.get("/admin/:orderId", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("items.product", "name images price description category")
      .lean();

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Admin order detail fetch error:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// PATCH /api/orders/admin/:orderId/status - Update order status (Admin only)
router.patch("/admin/:orderId/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true, runValidators: true }
    ).populate("items.product", "name images");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      message: "Order status updated successfully",
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        customerInfo: order.customerInfo,
        totalAmount: order.totalAmount,
      },
    });
  } catch (error) {
    console.error("Admin order status update error:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// DELETE /api/orders/admin/:orderId - Delete order (Admin only)
router.delete("/admin/:orderId", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Optional: Check if order can be deleted (e.g., not delivered)
    if (order.status === "delivered") {
      return res.status(400).json({ error: "Cannot delete delivered orders" });
    }

    await Order.findByIdAndDelete(req.params.orderId);

    res.json({
      message: "Order deleted successfully",
      deletedOrder: {
        orderNumber: order.orderNumber,
        customerName: order.customerInfo.name,
      },
    });
  } catch (error) {
    console.error("Admin order deletion error:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

export default router;

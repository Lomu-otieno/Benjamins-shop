// routes/products.js
import express from "express";
import Product from "../models/Product.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// GET /api/products - Get all products (Public)
router.get("/", async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Get single product (Public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= ADMIN ROUTES ================= //

// POST /api/products - Create new product (Admin only)
router.post("/", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      isActive = true,
    } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({
        error: "Name and price are required",
      });
    }

    let images = [];

    // Upload image to Cloudinary if provided
    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "products"
      );
      images.push({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        altText: name,
      });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      images,
      stock: stock || 0,
      isActive,
    });

    await product.save();
    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// PUT /api/products/:id - Update product (Admin only)
router.put("/:id", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, stock, isActive } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Handle new image upload if provided
    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "products"
      );

      // Add new image to images array
      product.images.push({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        altText: name || product.name,
      });
    }

    // Update other fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/products/:id - Partial update (Admin only)
router.patch("/:id", adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      "name",
      "description",
      "price",
      "category",
      "image",
      "stock",
      "isActive",
    ];

    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        error: "Invalid updates",
      });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete images from Cloudinary
    const { deleteFromCloudinary } = await import(
      "../utils/cloudinaryUpload.js"
    );
    const deletePromises = product.images.map((image) =>
      deleteFromCloudinary(image.publicId)
    );

    await Promise.all(deletePromises);

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product and associated images deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/admin/all - Get all products including inactive (Admin only)
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const products = await Product.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments();

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

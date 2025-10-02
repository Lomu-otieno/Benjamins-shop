// routes/upload.js
import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaryUpload.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// POST /api/upload - Upload single image
router.post("/", adminAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const result = await uploadToCloudinary(req.file.buffer, "products");

    res.status(200).json({
      message: "Image uploaded successfully",
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// POST /api/upload/multiple - Upload multiple images
router.post(
  "/multiple",
  adminAuth,
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No image files provided" });
      }

      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, "products")
      );

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      }));

      res.status(200).json({
        message: "Images uploaded successfully",
        images: uploadedImages,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload images" });
    }
  }
);

// DELETE /api/upload/:publicId - Delete image from Cloudinary
router.delete("/:publicId", adminAuth, async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await deleteFromCloudinary(publicId);

    if (result.result === "ok") {
      res.json({ message: "Image deleted successfully" });
    } else {
      res.status(404).json({ error: "Image not found" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

export default router;

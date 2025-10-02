import fs from "fs";
import mongoose from "mongoose";
import cloudinary from "./cloudinary.js";
import Submission from "./Submission.js"; // Make sure this points to your Mongoose model

/**
 * Handle form submission (with image upload)
 */
export const submitForm = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Photo is required" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "my_app",
    });

    // Delete temporary local file
    fs.unlinkSync(req.file.path);

    const formData = {
      ...req.body,
      photo: result.secure_url,
      public_id: result.public_id,
    };

    // Save to MongoDB
    const submission = new Submission(formData);
    await submission.save();

    console.log("📩 New Submission:", submission);

    res.json({
      success: true,
      message: "Form submitted successfully",
      data: submission,
    });
  } catch (error) {
    console.error("❌ Submit Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Fetch all submissions
 */
export const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting submission with ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const deleted = await Submission.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Delete image from Cloudinary after DB deletion
    if (deleted.public_id) {
      try {
        await cloudinary.uploader.destroy(deleted.public_id);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    }

    console.log("Deleted document from MongoDB:", deleted);
    res.json({ success: true, message: "Submission deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


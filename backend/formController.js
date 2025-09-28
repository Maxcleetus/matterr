import fs from "fs";
import cloudinary from "./cloudinary.js";
import Submission from "./Submission.js"; // Import the model

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

    fs.unlinkSync(req.file.path); // delete temp file

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
    console.log("📤 Fetching all submissions:", submissions);

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

import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary"; // 1. NEW IMPORT
import cloudinary from "./cloudinary.js"; // 2. NEW IMPORT (Your configuration file)

import { getSubmissions, deleteSubmission, signupAndEnroll, toogle, getToggleState, updatePassword } from "./formController.js";
import { getProfile, login } from "./LoginControl.js";
import  { adminProtect, protect } from "./auth.js";

// --- FIX START: Cloudinary Storage ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user-photos',
    allowedFormats: ['jpeg', 'png', 'jpg'],
    // Optional: Set a max file size to prevent large uploads from using excessive Vercel memory/time
    // limits: { fileSize: 1024 * 1024 * 5 } // Example: 5MB limit
  },
});

const upload = multer({ storage: storage });
// --- FIX END ---

const router = express.Router();

router.post("/login", login)

// ✅ This now uploads the photo directly to Cloudinary
router.post("/signup", upload.single("photo"), signupAndEnroll) 

router.get("/profile", getProfile);

router.put("/toggle-feature",adminProtect,toogle);

router.put("/reset",adminProtect,updatePassword);

router.get("/toggle-feature",protect,getToggleState)

router.get("/submissions",adminProtect,getSubmissions);

router.delete("/delete/:id",adminProtect, deleteSubmission);

export default router;
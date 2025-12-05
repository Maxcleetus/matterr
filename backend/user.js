import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js"; // Import your configured Cloudinary instance

import { signupAndEnroll, userLogin, userUpdate } from "./formController.js";
import {protect} from "./auth.js";

const user = express.Router();

// --- FIX: Cloudinary Storage to replace disk storage ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user-profile-photos', 
    allowedFormats: ['jpeg', 'png', 'jpg'],
  },
});

// This line no longer causes a crash!
const upload = multer({ storage: storage });
// ------------------------------------------------------


user.post("/signup", upload.single("photo"), signupAndEnroll) // File will go to Cloudinary
user.post("/login", userLogin)
user.put("/update", protect ,userUpdate)

export default user;
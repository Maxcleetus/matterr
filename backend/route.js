import express from "express";
import multer from "multer";
import { submitForm, getSubmissions } from "./formController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST - Submit form with photo
router.post("/submit", upload.single("photo"), submitForm);

// GET - Fetch all submissions
router.get("/submissions", getSubmissions);

export default router;

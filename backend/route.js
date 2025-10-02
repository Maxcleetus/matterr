import express from "express";
import multer from "multer";
import { submitForm, getSubmissions, deleteSubmission } from "./formController.js";
import { getProfile, login } from "./LoginControl.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST - Submit form with photo
router.post("/submit", upload.single("photo"), submitForm);

router.post("/login", login)

router.get("/profile", getProfile);

router.get("/submissions", getSubmissions);

router.delete("/delete/:id", deleteSubmission);

export default router;

import express from "express";
import multer from "multer";
import { getSubmissions, deleteSubmission, signupAndEnroll } from "./formController.js";
import { getProfile, login } from "./LoginControl.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });


router.post("/login", login)

router.post("/signup", upload.single("photo"), signupAndEnroll)

router.get("/profile", getProfile);

router.get("/submissions", getSubmissions);

router.delete("/delete/:id", deleteSubmission);

export default router;

import express from "express";


import { getSubmissions, deleteSubmission, signupAndEnroll, toogle, getToggleState, updatePassword } from "./formController.js";
import { getProfile, login } from "./LoginControl.js";
import  { adminProtect, protect } from "./auth.js";



const router = express.Router();

router.post("/login", login)

// ✅ This now uploads the photo directly to Cloudinary
router.post("/signup", signupAndEnroll) 

router.get("/profile", getProfile);

router.put("/toggle-feature",adminProtect,toogle);

router.put("/reset",adminProtect,updatePassword);

router.get("/toggle-feature",protect,getToggleState)

router.get("/submissions",adminProtect,getSubmissions);

router.delete("/delete/:id",adminProtect, deleteSubmission);

export default router;
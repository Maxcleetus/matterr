import express from "express";
import multer from "multer";
import { signupAndEnroll, userLogin, userUpdate } from "./formController.js";
import protect from "./auth.js";

const user = express.Router();
const upload = multer({ dest: "uploads/" });


user.post("/signup", upload.single("photo"), signupAndEnroll)
user.post("/login", userLogin)
user.put("/update", protect ,userUpdate)

export default user
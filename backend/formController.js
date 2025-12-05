// src/controllers/submissionController.js

import fs from "fs";
import mongoose from "mongoose";
import cloudinary from "./cloudinary.js"; // Adjust path as necessary
import Submission from "./Submission.js"; // Adjust path as necessary
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Toggle from "./toogle.js";


const SALT_ROUNDS = 10; 

// --- Utility Function (JWT Token Generation) ---
const generateToken = (id) => {
    // Ensure JWT_SECRET is set in your environment variables
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// -----------------------------------------------------------------------------
// 1. SIGNUP AND ENROLLMENT
// -----------------------------------------------------------------------------
export const signupAndEnroll = async (req, res) => {
    try {
        const {
            name, surname, familyName, email, password, dob, baptism,
            confirmation, occupation, status, phone, father, rite, role
            // Optional fields are also in req.body
        } = req.body;

        // --- 1. Basic Validation ---
        if (!req.file) {
            return res.status(400).json({ success: false, error: "Photo file is required for enrollment." });
        }

        const requiredFields = {
            name, surname, familyName, email, password, dob, baptism,
            confirmation, occupation, status, phone, father, rite, role
        };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ success: false, error: `Missing required field: ${key}` });
            }
        }

        // --- 2. Check if user already exists ---
        const existingUser = await Submission.findOne({ email });
        if (existingUser) {
            fs.unlinkSync(req.file.path);
            return res.status(409).json({ success: false, message: "Account already exists with this email." });
        }

        // --- 3. Process Credentials ---
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- 4. Upload Image to Cloudinary ---
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "my_app/enrollments",
        });

        // --- 5. Delete temporary local file ---
        fs.unlinkSync(req.file.path);

        // --- 6. Create final data object ---
        const submissionData = {
            ...req.body,
            password: hashedPassword, // Store hashed password
            photo: result.secure_url,
            public_id: result.public_id,
        };

        // --- 7. Save to MongoDB ---
        const newUser = new Submission(submissionData);
        await newUser.save();

        console.log("✅ New Enrollment & User Created:", newUser.email);

        // --- 8. Generate Token & Prepare Response Data ---
        const token = generateToken(newUser._id);
        const { password: _, public_id: __, ...userData } = newUser.toObject();

        res.status(201).json({
            success: true,
            message: "Account created and enrollment submitted successfully.",
            token,
            userData,
        });

    } catch (error) {
        console.error("❌ Sign Up/Enrollment Error:", error);
        
        // Clean up local file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ success: false, error: error.message });
    }
};




export const updatePassword = async (req, res) => {
  // 1. Get data from the request body
  const { email, password } = req.body;

  // Basic input validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and new password are required.' 
    });
  }

  try {
    // 2. Find the user by email
    const user = await Submission.findOne({ email });

    if (!user) {
      // Return a generic error message for security (don't confirm if email exists)
      return res.status(404).json({ 
        success: false, 
        message: 'User not found or credentials invalid.' 
      });
    }

    // 3. Hash the new password securely
    // This is crucial for protecting user data in the database
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Update the user's password field
    user.password = hashedPassword;
    await user.save(); // Save the updated user document

    // 5. Send Success Response
    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });

  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not update password.',
      error: error.message
    });
  }
};

// -----------------------------------------------------------------------------
// 2. USER LOGIN
// -----------------------------------------------------------------------------
export const userLogin = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const user = await Submission.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const token = generateToken(user._id);
        const { password: _, public_id: __, ...userData } = user.toObject();

        res.json({
            success: true,
            message: "Login successful!",
            token,
            userData
        });
        
    } catch (error) {
        console.error("❌ Login Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// -----------------------------------------------------------------------------
// 3. USER PROFILE UPDATE (NEW)
// -----------------------------------------------------------------------------
/**
 * Update user profile details
 * NOTE: Requires a middleware (like 'protect') to set req.user.id from the JWT token.
 * It strictly prevents updating sensitive fields like password and email.
 */
export const userUpdate = async (req, res) => {
    // Assumes authentication middleware has set req.user.id
    const userId = req.user?.id; 
    const updateFields = req.body;
    
    try {
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Please log in." });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format." });
        }

        // --- 1. Filter out sensitive/immutable fields ---
        const disallowedFields = ['password', 'email', 'familyName', 'photo', 'public_id', '_id', '__v', 'createdAt'];
        const updateData = {};

        for (const key in updateFields) {
            if (updateFields.hasOwnProperty(key) && !disallowedFields.includes(key)) {
                updateData[key] = updateFields[key];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: "No valid fields provided for update." });
        }
        
        // --- 2. Update the document in MongoDB ---
        const updatedUser = await Submission.findByIdAndUpdate(
            userId,
            { $set: updateData },
            // options: { new: true } returns the updated document, runValidators ensures schema validation
            { new: true, runValidators: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // --- 3. Prepare Response Data ---
        const { password: _, public_id: __, ...userData } = updatedUser.toObject();

        console.log("✅ User Profile Updated:", updatedUser.email);
        
        res.json({
            success: true,
            message: "Profile updated successfully.",
            user: userData, // Return the updated clean user data
        });

    } catch (error) {
        console.error("❌ Profile Update Error:", error.message);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }

        res.status(500).json({ success: false, message: "Server error during profile update." });
    }
};


// -----------------------------------------------------------------------------
// 4. FETCH ALL SUBMISSIONS (Admin)
// -----------------------------------------------------------------------------
export const getSubmissions = async (req, res) => {
    try {
        // NOTE: You should add an authorization check here to ensure only admins can run this
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

// -----------------------------------------------------------------------------
// 5. DELETE SUBMISSION (Admin)
// -----------------------------------------------------------------------------
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
                console.error("Cloudinary delete error (non-fatal):", err);
            }
        }

        console.log("Deleted document from MongoDB:", deleted._id);
        res.json({ success: true, message: "Submission deleted successfully" });
    } catch (error) {
        console.error("❌ Delete Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};


// Assume 'Toggle' is imported (e.g., import Toggle from './models/Toggle.js';)

export const toogle = async (req, res) => {
  const { enableFeature } = req.body;
  
  // Input Validation
  if (typeof enableFeature !== 'boolean') {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid input: enableFeature must be a boolean.' 
    });
  }

  try {
    // 1. Database Update Logic
    const uniqueToggleName = "globalFeatureToggle"; 
    
    // Find the single settings document and update the 'toggle' field
    const updatedToggle = await Toggle.findOneAndUpdate(
      { name: uniqueToggleName }, // Find criteria: using the unique name
      { toggle: enableFeature },  // Data to update
      { 
        new: true, // Return the updated document
        upsert: true, // Create the document if it doesn't exist
      }
    );
    
    // Safety check: ensure the operation actually returned a document
    if (!updatedToggle) {
      // This should rarely happen with upsert:true, but serves as a safeguard.
      throw new Error("Database operation failed: document not returned.");
    }
    
    // 2. Success Response Logic
    const action = updatedToggle.toggle ? "activated" : "deactivated";

    return res.status(200).json({
      success: true,
      message: `Toggle feature successfully ${action}.`,
      newState: updatedToggle.toggle 
    });

  } catch (error) {
    // 3. Error Handling Logic
    console.error('Database update error for /toggle-feature:', error);
    
    // Send a 500 status for any server/database error
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not save toggle state to database.',
      error: error.message // Optionally send a cleaner error message
    });
  }
};

// Assume Toggle model is imported
// import Toggle from '../models/Toggle.js'; 

export const getToggleState = async (req, res) => {
  try {
    const uniqueToggleName = "globalFeatureToggle"; 
    
    // 1. Find the single settings document
    const currentToggle = await Toggle.findOne({ name: uniqueToggleName });

    let currentState = false;

    if (currentToggle) {
        currentState = currentToggle.toggle;
    }
    // If not found, it defaults to false, which is safe.
    
    // 2. Send the current state
    return res.status(200).json({
      success: true,
      currentToggleState: currentState 
    });

  } catch (error) {
    console.error('Database read error for /toggle-feature:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not retrieve toggle state.',
    });
  }
};
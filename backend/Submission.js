import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  // --- Account Credentials ---
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true,
    // Note: The client side requires min 6 chars, but the hashed password will be longer.
  },

  // --- Personal & Family Details ---
  name: { type: String, required: true },
  surname: { type: String, required: true },
  
  // UPDATED: Changed from 'houseName' to 'familyName'
  familyName: { 
    type: String, 
    required: true,
    uppercase: true, // Matching client-side formatting
    trim: true,
    minlength: 2
  }, 
  
  dob: { type: String, required: true },
  occupation: { type: String, required: true },
  status: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true }, // Added role
  
  father: { type: String, required: true },
  mother: { type: String }, // Made optional as per client form
  
  // --- Sacramental Details ---
  baptism: { type: String, required: true },
  confirmation: { type: String, required: true },
  marriage: { type: String }, // Optional
  rite: { type: String, required: true },

  // --- Origin & Current Location ---
  // Note: Making parish and diocese optional as per the client's form structure
  parishOrigin: { type: String }, 
  dioceseOrigin: { type: String },
  presentPlace: { type: String }, // Added presentPlace
  parish: { type: String }, 
  diocese: { type: String },
  
  // --- Photo & Cloudinary Details ---
  photo: { type: String, required: true }, // The secure_url from Cloudinary
  public_id: { type: String }, // Cloudinary resource ID for deletion
  
}, { timestamps: true });

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
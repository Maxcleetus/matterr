import mongoose from "mongoose";

const toggleSchema = new mongoose.Schema({
  // Unique field to ensure only one document exists for this setting
  name: {
    type: String,
    unique: true,
    required: true,
    default: "globalFeatureToggle", // A constant value
  },
  
  // The actual toggle state
  toggle: { 
    type: Boolean,
    default: false,
  },
  
}, { timestamps: true });

const Toggle = mongoose.model("Toggle", toggleSchema);
export default Toggle;
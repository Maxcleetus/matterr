import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  parish: { type: String, required: true },
  diocese: { type: String, required: true },
  dob: { type: String, required: true },
  baptism: { type: String, required: true },
  confirmation: { type: String, required: true },
  marriage: { type: String },
  occupation: { type: String, required: true },
  status: { type: String, required: true },
  phone: { type: String, required: true },
  father: { type: String, required: true },
  mother: { type: String, required: true },
  rite: { type: String, required: true },
  photo: { type: String, required: true },
  public_id: { type: String },
}, { timestamps: true });

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;

// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./mongo.js"; 
import router from "./route.js";

dotenv.config();

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ CORS configuration (allow frontend)
app.use(cors({
  origin: "http://localhost:5173", // your React frontend
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Body parser with increased limits
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ API routes
app.use("/api", router);

// ✅ Example route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

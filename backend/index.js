import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./mongo.js"; 
import router from "./route.js";

dotenv.config({ override: true });
console.log("✅ Loaded env:", process.env.USERNAME, process.env.PASSWORD);


const app = express();

// ✅ Body parser must come first
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Connect to MongoDB
connectDB();

// ✅ CORS configuration
const allowedOrigins = ["https://matterr-6.onrender.com/", "https://matterr-3.onrender.com/"];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// ✅ Routes
app.use("/api", router);

// ✅ Example route
app.get("/", (req, res) => res.send("API is running 🚀"));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

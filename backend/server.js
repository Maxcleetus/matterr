import express from "express";
import dotenv from "dotenv";
// import http from 'http'; // ❌ REMOVE THIS IMPORT
import "dotenv/config";
import cors from "cors";
import connectDB from "./mongo.js";
import router from "./route.js";
import user from './user.js'

dotenv.config({ override: true });
console.log("✅ Loaded env:", process.env.USERNAME, process.env.PASSWORD);

const app = express();
// ❌ REMOVE: const server = http.createServer(app); // Vercel handles the server

// ✅ Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Connect to MongoDB
connectDB();

// ✅ CORS configuration
const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  }
}));

// ✅ Routes
app.use("/api", router);
app.use("/api/user", user);

// ✅ Example route
app.get("/", (req, res) => res.send("API is running on Vercel 🚀"));

// ❌ REMOVE THIS ENTIRE BLOCK: The listening logic is for local development only.
/*
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
*/

// ✅ EXPORT THE EXPRESS APP (CRUCIAL for Vercel)
export default app;
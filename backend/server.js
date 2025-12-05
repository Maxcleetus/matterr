import express from "express";
import dotenv from "dotenv";
import "dotenv/config";
import cors from "cors";
import connectDB from "./mongo.js";
import router from "./route.js";
import user from './user.js'

dotenv.config({ override: true });
console.log("✅ Loaded env:", process.env.USERNAME, process.env.PASSWORD);

const app = express();

// ✅ Body parser
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Connect to MongoDB
connectDB();

// --- ✅ FIX: CORS configuration to allow all origins (*) ---
// This simplifies the middleware and resolves the "No 'Access-Control-Allow-Origin'" error.

// You can also explicitly use:
/*
app.use(cors({
  origin: '*'
}));
*/

// ❌ REMOVE THE OLD BLOCK: The custom logic is no longer needed
/*
const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "https://matterr.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  }
}));
*/
// -------------------------------------------------------------

// ✅ Routes
app.use("/api", router);
app.use("/api/user", user);

// ✅ Example route
app.get("/", (req, res) => res.send("API is running on Vercel 🚀"));

//app.listen(5000, () => console.log('Server is running on port 5000'));

// ✅ EXPORT THE EXPRESS APP (CRUCIAL for Vercel)
export default app;
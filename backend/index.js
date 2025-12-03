import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./mongo.js";
import router from "./route.js";
import user from './user.js'

dotenv.config({ override: true });
console.log("✅ Loaded env:", process.env.USERNAME, process.env.PASSWORD);

const app = express();

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
    if (!origin) return callback(null, true); // allow Postman or server-to-server
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false); // reject other origins
  }
}));

// ✅ Routes
app.use("/api", router);
app.use("/api/user", user);

// ✅ Example route
app.get("/", (req, res) => res.send("API is running 🚀"));

// ✅ Start server
if (process.env.NODE_ENV != "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default server

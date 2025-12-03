import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./mongo.js";
import router from "./route.js";
import user from './user.js';

dotenv.config({ override: true });
console.log("✅ Loaded env:", process.env.USERNAME, process.env.PASSWORD);

const app = express();

// ✅ Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Connect to MongoDB
connectDB();

// ✅ CORS configuration - MORE PERMISSIVE FOR VERCEL
const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://your-frontend-domain.vercel.app", // Add your Vercel frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    // Allow specific origins in production
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject other origins
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Routes
app.use("/api", router);
app.use("/api/user", user);

// ✅ Example route
app.get("/", (req, res) => res.send("API is running 🚀"));

// ✅ Health check endpoint for Vercel
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'production' && { stack: err.stack })
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Start server locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

// ✅ Export for Vercel
export default app;
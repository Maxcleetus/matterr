import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ override: true });

const JWT_SECRET = process.env.JWT_SECRET;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

export const login = (req, res) => {
  console.log("🔐 Expected Credentials:", { USERNAME, PASSWORD });
  console.log("🔐 Login Attempt:", req.body);

  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
};

export const getProfile = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ success: false, message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch {
    res.status(403).json({ success: false, message: "Invalid token" });
  }
};
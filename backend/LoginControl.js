import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ override: true });

const JWT_SECRET = process.env.JWT_SECRET;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;


export const login = (req, res) => {
  // Use a try...catch block to wrap the core logic for robustness
  try {

    // 2. Extract Credentials
    const { username, password } = req.body;

    // Basic Input Validation
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    // 3. Authenticate Credentials
    // NOTE: This uses direct string comparison. In a real app, use bcrypt.compare() against a hashed password.
    if (username === USERNAME && password === PASSWORD) {

      // 4. Issue JWT
      // Include the necessary payload (e.g., username, role)

      const payload = {
        username: username, // First claim
        role: 'admin'       // Second claim (The one the middleware needs!)
      };

      // 5. Pass the single payload object as the first argument
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
      // 5. Send Success Response
      return res.status(200).json({
        success: true,
        message: "Authentication successful.",
        token
      });

    } else {
      // 6. Send Authentication Failure Response
      // Return a generic error message for security (don't specify if username or password was wrong)
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during login." });
  }
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
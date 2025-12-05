// Example: src/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import Submission from './Submission.js'; // Assuming your model is here

export const  protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user ID to request (excluding password)
            req.user = await Submission.findById(decoded.id).select('-password'); 

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};




export const adminProtect = (req, res, next) => {
    let token;

    // 1. Check for token in the 'Authorization' header
    // The token must start with 'Bearer '
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (removes 'Bearer ')
            token = req.headers.authorization.split(' ')[1];
            console.log(token)

            // 2. Verify and Decode Token
            // This checks the signature and expiration time.
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 

            // 3. Authorization Check: Verify Role from Payload
            // Your login function adds role: 'admin' to the token.
            console.log("decoded is ",decoded)
            console.log(decoded.role)
            if (decoded.role !== 'admin') {
                // Deny access if the token is valid but the role is not 'admin'
                console.warn(`Access denied: Token role is '${decoded.role}', expected 'admin'.`);
                return res.status(403).json({ message: 'Forbidden: Requires admin privileges' });
            }

            // 4. Attach Payload to Request
            // Attach the decoded token payload (which includes username and role) to req.user
            req.user = decoded; 

            // 5. Proceed
            next();

        } catch (error) {
            // Handles token verification failure (expired, invalid signature, etc.)
            console.error("JWT Authentication Error:", error);
            return res.status(401).json({ message: 'Not authorized, token is invalid or expired' });
        }
    } else {
        // 6. No Token Found
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};
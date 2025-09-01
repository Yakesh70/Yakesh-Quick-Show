import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

// Middleware to protect routes for all authenticated users
export const protect = ClerkExpressWithAuth();

// Middleware to protect routes for admin users only
export const protectAdmin = [protect, (req, res, next) => {
  // Temporarily allow any authenticated user for testing
  if (req.auth?.userId) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Authentication required" });
  }
}];

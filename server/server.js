import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { protectAdmin } from './middleware/auth.js';

const app = express();
const port = process.env.PORT || 3000;

try {
  await connectDB();
} catch (error) {
  console.error('Database connection failed:', error);
  // Continue without DB for now
}

// Stripe Webhooks Route
app.use('/api/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// Middleware
app.use(express.json());
app.use(cors());

// Initialize Clerk middleware to make req.auth available on all protected routes
const protect = ClerkExpressWithAuth();

// API Routes
app.get('/', (req, res)=> res.send('Server is Live!'));
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/show', showRouter);
app.use('/api/booking', protect, bookingRouter);
app.use('/api/admin', ...protectAdmin, adminRouter);
app.use('/api/user', protect, userRouter);


if (process.env.NODE_ENV !== 'production') {
  app.listen(port, ()=> console.log(`Server listening at http://localhost:${port}`));
}

export default app;

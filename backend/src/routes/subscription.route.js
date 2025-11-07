import express from 'express';
import {
  getCurrentSubscription,
  createSubscriptionCheckout,
  cancelUserSubscription,
  updateUserSubscription,
  getBillingPortal,
  getUserInvoices,
  handleWebhook
} from '../controllers/subscription.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public webhook endpoint (no auth)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.get('/current', protectRoute, getCurrentSubscription);
router.post('/checkout', protectRoute, createSubscriptionCheckout);
router.post('/cancel', protectRoute, cancelUserSubscription);
router.put('/update', protectRoute, updateUserSubscription);
router.get('/billing-portal', protectRoute, getBillingPortal);
router.get('/invoices', protectRoute, getUserInvoices);

export default router;

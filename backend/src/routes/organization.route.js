import express from 'express';
import {
  createOrganization,
  getOrganization,
  getUserOrganizations,
  inviteMember,
  removeMember,
  updateMemberRole,
  updateOrganization,
  createOrgSubscriptionCheckout,
  getOrganizationAnalytics
} from '../controllers/organization.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create', protectRoute, createOrganization);
router.get('/my-organizations', protectRoute, getUserOrganizations);
router.get('/:slug', protectRoute, getOrganization);
router.post('/:slug/invite', protectRoute, inviteMember);
router.delete('/:slug/members/:userId', protectRoute, removeMember);
router.put('/:slug/members/:userId/role', protectRoute, updateMemberRole);
router.put('/:slug', protectRoute, updateOrganization);
router.post('/:slug/subscription/checkout', protectRoute, createOrgSubscriptionCheckout);
router.get('/:slug/analytics', protectRoute, getOrganizationAnalytics);

export default router;

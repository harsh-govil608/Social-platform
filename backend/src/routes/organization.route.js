import express from 'express';
import {
  createOrganization,
  getOrganization,
  getUserOrganizations,
  inviteMember,
  bulkInviteMembers,
  removeMember,
  updateMemberRole,
  updateOrganization,
  createOrgSubscriptionCheckout,
  getOrganizationAnalytics,
  getOrgBranding
} from '../controllers/organization.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { orgMemberRoute, orgAdminRoute } from '../middleware/org.middleware.js';

const router = express.Router();

router.post('/create', protectRoute, createOrganization);
router.get('/my-organizations', protectRoute, getUserOrganizations);
router.get('/:slug', protectRoute, orgMemberRoute, getOrganization);
router.get('/:slug/branding', protectRoute, orgMemberRoute, getOrgBranding);
router.get('/:slug/analytics', protectRoute, orgAdminRoute, getOrganizationAnalytics);
router.post('/:slug/invite', protectRoute, orgAdminRoute, inviteMember);
router.post('/:slug/invite/bulk', protectRoute, orgAdminRoute, bulkInviteMembers);
router.delete('/:slug/members/:userId', protectRoute, orgAdminRoute, removeMember);
router.put('/:slug/members/:userId/role', protectRoute, orgAdminRoute, updateMemberRole);
router.put('/:slug', protectRoute, orgAdminRoute, updateOrganization);
router.post('/:slug/subscription/checkout', protectRoute, createOrgSubscriptionCheckout);

export default router;

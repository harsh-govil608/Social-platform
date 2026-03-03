import Organization from '../models/Organization.js';
import { log } from '../lib/logger.js';

/**
 * Finds org by req.params.slug, verifies req.user is a member or admin/owner,
 * and sets req.organization. Must run after protectRoute.
 */
export const orgMemberRoute = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const organization = await Organization.findOne({ slug });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const userId = req.user._id;
    const isMember = organization.isMember(userId);
    const isAdmin = organization.isAdmin(userId);

    if (!isMember && !isAdmin) {
      return res.status(403).json({ message: 'You are not a member of this organization' });
    }

    req.organization = organization;
    next();
  } catch (error) {
    log.warn('Error in orgMemberRoute middleware', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Same as orgMemberRoute but also requires admin/owner role.
 */
export const orgAdminRoute = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const organization = await Organization.findOne({ slug });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (!organization.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can perform this action' });
    }

    req.organization = organization;
    next();
  } catch (error) {
    log.warn('Error in orgAdminRoute middleware', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Factory middleware that checks whether a specific feature is enabled for the org.
 * Requires orgMemberRoute or orgAdminRoute to have run first (sets req.organization).
 * @param {string} featureName - key in organization.features
 */
export const featureGate = (featureName) => (req, res, next) => {
  const org = req.organization;
  if (!org) {
    return res.status(500).json({ message: 'Organization not loaded — run orgMemberRoute first' });
  }

  if (!org.features || !org.features[featureName]) {
    return res.status(403).json({
      message: `Feature '${featureName}' is not enabled for your organization. Please upgrade your plan.`
    });
  }

  next();
};

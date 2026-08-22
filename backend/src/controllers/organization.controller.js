import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { createCustomer, createCheckoutSession, STRIPE_PRICES } from '../lib/stripe.js';
import { log } from '../lib/logger.js';

// Create organization
export const createOrganization = async (req, res) => {
  try {
    const { name, type, slug, seats = 50 } = req.body;

    // Check if slug is available
    const existing = await Organization.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Organization slug already taken' });
    }

    // Create organization
    const organization = await Organization.create({
      name,
      slug: slug.toLowerCase(),
      type,
      owner: req.user._id,
      admins: [req.user._id],
      subscription: {
        tier: 'starter',
        seats,
        status: 'trialing',
        trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14-day trial
      }
    });

    // Add owner as first member
    organization.members.push({
      user: req.user._id,
      role: 'admin'
    });
    organization.subscription.usedSeats = 1;
    organization.stats.totalMembers = 1;
    await organization.save();

    res.status(201).json({
      message: 'Organization created successfully',
      organization
    });
  } catch (error) {
    log.error('Error creating organization:', error);
    res.status(500).json({ message: 'Failed to create organization', error: error.message });
  }
};

// Get organization details
export const getOrganization = async (req, res) => {
  try {
    const { slug } = req.params;

    const organization = await Organization.findOne({ slug })
      .populate('owner', 'fullName email profilePicture')
      .populate('admins', 'fullName email profilePicture')
      .populate('members.user', 'fullName email profilePicture username');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user has access
    if (!organization.isMember(req.user._id) && !organization.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ organization });
  } catch (error) {
    log.error('Error getting organization:', error);
    res.status(500).json({ message: 'Failed to get organization' });
  }
};

// Get user's organizations
export const getUserOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({
      $or: [
        { owner: req.user._id },
        { admins: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).populate('owner', 'fullName profilePicture');

    res.json({ organizations });
  } catch (error) {
    log.error('Error getting user organizations:', error);
    res.status(500).json({ message: 'Failed to get organizations' });
  }
};

// Invite member to organization
export const inviteMember = async (req, res) => {
  try {
    const { slug } = req.params;
    const { email, role = 'member' } = req.body;

    const organization = await Organization.findOne({ slug });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is admin
    if (!organization.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can invite members' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found. They must sign up first.' });
    }

    // Check if already a member
    if (organization.isMember(user._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add member
    organization.addMember(user._id, role);
    await organization.save();

    // TODO: Send email notification to user

    res.json({
      message: 'Member invited successfully',
      organization
    });
  } catch (error) {
    log.error('Error inviting member:', error);
    res.status(500).json({ message: error.message || 'Failed to invite member' });
  }
};

// Remove member from organization
export const removeMember = async (req, res) => {
  try {
    const { slug, userId } = req.params;

    const organization = await Organization.findOne({ slug });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is admin
    if (!organization.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Cannot remove owner
    if (organization.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove organization owner' });
    }

    organization.removeMember(userId);
    await organization.save();

    res.json({
      message: 'Member removed successfully',
      organization
    });
  } catch (error) {
    log.error('Error removing member:', error);
    res.status(500).json({ message: 'Failed to remove member' });
  }
};

// Update member role
export const updateMemberRole = async (req, res) => {
  try {
    const { slug, userId } = req.params;
    const { role } = req.body;

    if (!['member', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const organization = await Organization.findOne({ slug });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is admin
    if (!organization.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can update roles' });
    }

    // Find and update member
    const member = organization.members.find(m => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.role = role;

    // Update admins array if role is admin
    if (role === 'admin' && !organization.admins.includes(userId)) {
      organization.admins.push(userId);
    } else if (role !== 'admin') {
      organization.admins = organization.admins.filter(id => id.toString() !== userId);
    }

    await organization.save();

    res.json({
      message: 'Member role updated successfully',
      organization
    });
  } catch (error) {
    log.error('Error updating member role:', error);
    res.status(500).json({ message: 'Failed to update member role' });
  }
};

// Update organization settings
export const updateOrganization = async (req, res) => {
  try {
    const { slug } = req.params;
    const updates = req.body;

    const organization = await Organization.findOne({ slug });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is admin
    if (!organization.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can update organization' });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'contact', 'settings', 'branding'];
    for (const key of allowedUpdates) {
      if (updates[key]) {
        organization[key] = { ...organization[key], ...updates[key] };
      }
    }

    await organization.save();

    res.json({
      message: 'Organization updated successfully',
      organization
    });
  } catch (error) {
    log.error('Error updating organization:', error);
    res.status(500).json({ message: 'Failed to update organization' });
  }
};

// Create organization subscription checkout
export const createOrgSubscriptionCheckout = async (req, res) => {
  try {
    const { slug } = req.params;
    const { tier, seats } = req.body;

    if (!['starter', 'growth', 'enterprise'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid subscription tier' });
    }

    const organization = await Organization.findOne({ slug });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is owner
    if (organization.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can manage subscription' });
    }

    const user = await User.findById(req.user._id);

    // Create or get Stripe customer
    let stripeCustomerId = organization.billing?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await createCustomer(
        organization.contact?.email || user.email,
        organization.name,
        {
          organizationId: organization._id.toString(),
          type: 'organization'
        }
      );
      stripeCustomerId = customer.id;
      organization.billing.stripeCustomerId = stripeCustomerId;
      await organization.save();
    }

    // Get price ID
    const priceId = STRIPE_PRICES[`org_${tier}`];

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      priceId,
      successUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/organization/${slug}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/organization/${slug}/settings`,
      metadata: {
        organizationId: organization._id.toString(),
        tier,
        seats: seats || organization.subscription.seats
      }
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    log.error('Error creating org subscription checkout:', error);
    res.status(500).json({ message: 'Failed to create checkout session', error: error.message });
  }
};

// Bulk invite members
export const bulkInviteMembers = async (req, res) => {
  try {
    const { slug } = req.params;
    const { emails, role = 'member' } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'emails must be a non-empty array' });
    }

    const organization = await Organization.findOne({ slug });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const result = {
      added: [],
      notFound: [],
      alreadyMember: [],
      seatLimitReached: false
    };

    for (const email of emails) {
      // Check seat limit before each addition
      if (organization.subscription.usedSeats >= organization.subscription.seats) {
        result.seatLimitReached = true;
        break;
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        result.notFound.push(email);
        continue;
      }

      if (organization.isMember(user._id)) {
        result.alreadyMember.push(email);
        continue;
      }

      organization.addMember(user._id, role);
      result.added.push(email);
    }

    await organization.save();

    res.json({ message: 'Bulk invite completed', result });
  } catch (error) {
    log.error('Error in bulkInviteMembers:', error);
    res.status(500).json({ message: error.message || 'Failed to bulk invite members' });
  }
};

// Get organization branding
export const getOrgBranding = async (req, res) => {
  try {
    const organization = req.organization; // set by orgMemberRoute

    const branding = {
      logo: organization.branding?.logo || null,
      primaryColor: organization.branding?.primaryColor || '#3B82F6',
      secondaryColor: organization.branding?.secondaryColor || '#8B5CF6',
      customDomain: organization.branding?.customDomain || null,
      emailFromName: organization.branding?.emailFromName || organization.name
    };

    res.json({ branding });
  } catch (error) {
    log.error('Error getting org branding:', error);
    res.status(500).json({ message: 'Failed to get branding' });
  }
};

// Get organization analytics
export const getOrganizationAnalytics = async (req, res) => {
  try {
    const { slug } = req.params;

    const organization = await Organization.findOne({ slug });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user has access
    if (!organization.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can view analytics' });
    }

    // Get member statistics
    const memberIds = organization.members.map(m => m.user);

    // Get aggregated learning stats
    const UserActivity = (await import('../models/UserActivity.js')).default;
    const activities = await UserActivity.find({ user: { $in: memberIds } });

    const analytics = {
      overview: {
        totalMembers: organization.stats.totalMembers,
        activeMembers: organization.stats.activeMembers,
        usedSeats: organization.subscription.usedSeats,
        availableSeats: organization.subscription.seats - organization.subscription.usedSeats
      },
      learning: {
        totalLearningHours: activities.reduce((sum, a) => sum + (a.totalLearningTime || 0), 0),
        avgLearningHoursPerMember: activities.length > 0
          ? activities.reduce((sum, a) => sum + (a.totalLearningTime || 0), 0) / activities.length
          : 0,
        totalChallengesCompleted: organization.stats.completedChallenges || 0,
        totalAchievements: activities.reduce((sum, a) => sum + (a.achievements?.length || 0), 0)
      },
      engagement: {
        averageLevel: activities.length > 0
          ? activities.reduce((sum, a) => sum + (a.gamification?.level || 1), 0) / activities.length
          : 1,
        totalXP: activities.reduce((sum, a) => sum + (a.gamification?.xp || 0), 0),
        activeThisWeek: 0, // TODO: Calculate based on lastActive
        activeThisMonth: 0
      },
      topPerformers: activities
        .sort((a, b) => (b.gamification?.xp || 0) - (a.gamification?.xp || 0))
        .slice(0, 10)
        .map(a => ({
          userId: a.user,
          xp: a.gamification?.xp || 0,
          level: a.gamification?.level || 1,
          achievements: a.achievements?.length || 0
        }))
    };

    res.json({ analytics });
  } catch (error) {
    log.error('Error getting organization analytics:', error);
    res.status(500).json({ message: 'Failed to get analytics' });
  }
};

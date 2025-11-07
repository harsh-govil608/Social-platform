export const isAdmin = async (req, res, next) => {
  try {
    // Check if user exists from protectRoute middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (error) {
    console.log('Error in isAdmin middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

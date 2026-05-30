const { requireAuth } = require('@clerk/express');

// Admin role check - extend this based on Clerk metadata or custom system
const adminOnly = (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ message: 'Unauthorized - Please login' });
        }

        // Admin user IDs (hardcoded for now - can be extended to database)
        const adminUsers = process.env.ADMIN_USERS?.split(',') || [];
        
        if (!adminUsers.includes(req.auth.userId)) {
            return res.status(403).json({ message: 'Forbidden - Admin access required' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { adminOnly };

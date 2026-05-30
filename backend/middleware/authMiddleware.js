const { requireAuth, getAuth } = require('@clerk/express');

// For protected routes, require authentication
const protect = requireAuth();

// Alternative middleware that doesn't require auth but extracts it if present
const optionalAuth = (req, res, next) => {
    const auth = getAuth(req);
    if (auth && auth.userId) {
        req.auth = { userId: auth.userId };
    }
    next();
};

module.exports = { protect, optionalAuth };

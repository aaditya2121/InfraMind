const admin = require('../config/firebaseAdmin');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // If no token, we set user to anonymous and let the route decide
        req.user = null;
        return next();
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error.message);
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }
};

const requireAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    try {
        // Check Firestore to see if this user is actually an admin
        const db = admin.firestore();
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            return res.status(403).json({ error: 'Forbidden', message: 'User record not found' });
        }

        if (userDoc.data().role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
        }

        // Role verified
        req.user.role = 'admin';
        next();
    } catch (error) {
        console.error('Error verifying admin role:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }
    next();
};

module.exports = { verifyToken, requireAdmin, requireAuth };

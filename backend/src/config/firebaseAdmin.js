const admin = require('firebase-admin');

// Initialize Firebase Admin SDK.
// Priority order:
//   1. FIREBASE_SERVICE_ACCOUNT_BASE64 env var (production / Render)
//   2. Local firebase-service-account.json file (development)
//   3. Project ID only fallback (limited — no token verification)

if (admin.apps.length === 0) {
    try {
        let serviceAccount = null;

        // 1. Try Base64-encoded env var (set on Render / any cloud host)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
            try {
                const json = Buffer.from(
                    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
                    'base64'
                ).toString('utf8');
                serviceAccount = JSON.parse(json);
            } catch (e) {
                console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', e.message);
            }
        }

        // 2. Fall back to local JSON file (development)
        if (!serviceAccount) {
            try {
                serviceAccount = require('../../../firebase-service-account.json');
            } catch (e) {
                serviceAccount = null;
            }
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin SDK initialized with service account.');
        } else {
            // 3. Last resort: project ID only (no token verification)
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID || 'hackminded',
            });
            console.log('Firebase Admin SDK initialized with project ID only (token verification limited).');
        }
    } catch (error) {
        if (!/already exists/.test(error.message)) {
            console.error('Firebase Admin Initialization Error:', error.message);
        }
    }
}

module.exports = admin;

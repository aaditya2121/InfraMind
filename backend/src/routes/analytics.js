const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/analyticsController');

// @route   GET /api/analytics/summary
// @desc    Get full analytics snapshot for the admin dashboard
router.get('/summary', getSummary);

module.exports = router;

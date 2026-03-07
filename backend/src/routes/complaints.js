const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, linkComplaints, previewClassification } = require('../controllers/complaintController');
const { verifyToken } = require('../middleware/authMiddleware');

// @route   POST /api/complaints/classify
// @desc    Preview classification for frontend (no save)
router.post('/classify', previewClassification);

// @route   POST /api/complaints
// @desc    Create a new maintenance complaint
router.post('/', verifyToken, createComplaint);

// @route   POST /api/complaints/link
// @desc    Link Guest complaints to a User account
router.post('/link', verifyToken, linkComplaints);

// @route   GET /api/complaints
// @desc    Get all complaints
router.get('/', verifyToken, getComplaints);

module.exports = router;

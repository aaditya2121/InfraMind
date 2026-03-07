const express = require('express');
const router = express.Router();
const { assignStaff, updateStatus, getOverdueTickets, exportCSV } = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Apply auth protection to all admin routes
router.use(verifyToken, requireAdmin);

// Ticket management
router.put('/complaints/:id/assign', assignStaff);
router.put('/complaints/:id/status', updateStatus);

// SLA - overdue tickets
router.get('/complaints/overdue', getOverdueTickets);

// Data export
router.get('/export/csv', exportCSV);

module.exports = router;

const Complaint = require('../models/Complaint');

// @desc    Assign staff to a ticket
// @route   PUT /api/admin/complaints/:id/assign
const assignStaff = async (req, res) => {
  try {
    const { department, staff_id } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (department) complaint.department = department;
    if (staff_id) complaint.assigned_to = staff_id;
    const updated = await complaint.save();
    res.status(200).json({ message: 'Staff assigned successfully', data: updated });
  } catch (error) {
    console.error('Error assigning staff:', error);
    res.status(500).json({ error: 'Server error while assigning staff' });
  }
};

// @desc    Update complaint status
// @route   PUT /api/admin/complaints/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed', 'Escalated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    complaint.status = status;
    const updated = await complaint.save();
    res.status(200).json({ message: 'Complaint status updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Server error while updating status' });
  }
};

// @desc    Get all overdue tickets (past SLA deadline)
// @route   GET /api/admin/complaints/overdue
const getOverdueTickets = async (req, res) => {
  try {
    const now = new Date();
    const overdue = await Complaint.find({
      status: { $in: ['Open', 'In Progress', 'Escalated'] },
      sla_deadline: { $lt: now }
    }).sort({ sla_deadline: 1 });
    res.status(200).json({ count: overdue.length, data: overdue });
  } catch (error) {
    console.error('Error fetching overdue tickets:', error);
    res.status(500).json({ error: 'Server error fetching overdue tickets' });
  }
};

// @desc    Export all complaints as a downloadable CSV file
// @route   GET /api/admin/export/csv
const exportCSV = async (req, res) => {
  try {
    const { department, status, from, to } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (from || to) {
      filter.created_at = {};
      if (from) filter.created_at.$gte = new Date(from);
      if (to) filter.created_at.$lte = new Date(to);
    }

    const complaints = await Complaint.find(filter).sort({ created_at: -1 });

    const headers = ['ID', 'User ID', 'Location', 'Description', 'Category', 'Priority', 'Department', 'Status', 'Is Recurring', 'SLA Deadline', 'Created At'];
    const rows = complaints.map(c => [
      c._id,
      c.user_id,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.department,
      c.status,
      c.is_recurring ? 'Yes' : 'No',
      c.sla_deadline ? new Date(c.sla_deadline).toISOString() : '',
      new Date(c.created_at).toISOString()
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const filename = `inframind-export-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Server error exporting data' });
  }
};

module.exports = { assignStaff, updateStatus, getOverdueTickets, exportCSV };

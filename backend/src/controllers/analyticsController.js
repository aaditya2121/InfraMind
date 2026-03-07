const Complaint = require('../models/Complaint');

// @desc    Get analytics summary for the admin dashboard
// @route   GET /api/analytics/summary
// @access  Admin
const getSummary = async (req, res) => {
  try {
    const [statusBreakdown, categoryBreakdown, priorityBreakdown, departmentBreakdown, resolutionTime, hotspots] = await Promise.all([

      // Tickets by status
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Tickets by category
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Tickets by priority
      Complaint.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),

      // Tickets by department (open only)
      Complaint.aggregate([
        { $match: { status: { $in: ['Open', 'In Progress', 'Escalated'] } } },
        { $group: { _id: '$department', open: { $sum: 1 } } },
        { $sort: { open: -1 } }
      ]),

      // Average resolution time (in hours) for resolved tickets
      Complaint.aggregate([
        { $match: { status: 'Resolved' } },
        {
          $project: {
            resolutionHours: {
              $divide: [{ $subtract: ['$sla_deadline', '$created_at'] }, 3600000]
            }
          }
        },
        { $group: { _id: null, avgHours: { $avg: '$resolutionHours' } } }
      ]),

      // Top 5 hotspot locations by complaint count
      Complaint.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const totalComplaints = await Complaint.countDocuments();

    res.status(200).json({
      total: totalComplaints,
      by_status: statusBreakdown.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      by_category: categoryBreakdown,
      by_priority: priorityBreakdown.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {}),
      by_department: departmentBreakdown,
      avg_resolution_hours: resolutionTime[0]?.avgHours?.toFixed(1) || null,
      top_hotspots: hotspots
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};

module.exports = { getSummary };

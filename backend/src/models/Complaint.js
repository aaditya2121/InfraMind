const mongoose = require('mongoose');

// SLA hours by priority
const SLA_HOURS = { High: 4, Medium: 24, Low: 72 };

const complaintSchema = new mongoose.Schema({
  user_id: { type: String, default: 'anonymous' },
  location: { type: String, required: true },
  description: { type: String, required: true },
  image_url: { type: String, default: null },
  category: { type: String, default: 'Pending AI' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  department: { type: String, default: 'Unassigned' },
  assigned_to: { type: String, default: null },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed', 'Escalated'],
    default: 'Open'
  },
  // SLA tracking
  sla_deadline: { type: Date },
  // AI recurring issue detection
  is_recurring: { type: Boolean, default: false },
  recurrence_note: { type: String, default: null },
  // AI Robustness metadata
  is_relevant: { type: Boolean, default: true },
  ai_analysis_note: { type: String, default: null },
  is_duplicate: { type: Boolean, default: false },
  location_integrity: { type: String, enum: ['Verified', 'Suspicious', 'Inconsistent'], default: 'Verified' },
  location_mismatch: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

// Auto-set sla_deadline when a complaint is created
complaintSchema.pre('save', function () {
  if (this.isNew) {
    const hours = SLA_HOURS[this.priority] || 24;
    this.sla_deadline = new Date(Date.now() + hours * 60 * 60 * 1000);
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);

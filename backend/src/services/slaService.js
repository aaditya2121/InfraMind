const cron = require('node-cron');
const Complaint = require('../models/Complaint');

/**
 * SLA Service
 * Runs every 10 minutes.
 * Finds any Open/In Progress tickets that have breached their SLA deadline
 * and escalates them automatically.
 */
const startSLACron = () => {
  console.log('⏱️  SLA Escalation Service started.');

  // Runs every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      const now = new Date();

      const result = await Complaint.updateMany(
        {
          status: { $in: ['Open', 'In Progress'] },
          sla_deadline: { $lt: now }
        },
        { $set: { status: 'Escalated' } }
      );

      if (result.modifiedCount > 0) {
        console.log(`🚨 SLA Cron: Escalated ${result.modifiedCount} overdue ticket(s) at ${now.toISOString()}`);
      }
    } catch (error) {
      console.error('SLA Cron Error:', error.message);
    }
  });
};

module.exports = { startSLACron };

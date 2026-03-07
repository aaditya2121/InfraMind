const Complaint = require('../models/Complaint');
const { classifyIssue, detectRecurrence } = require('../services/aiService');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Public (for MVP)
const createComplaint = async (req, res) => {
  try {
    const { user_id, location, description, image_url } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    let finalDescription = description || "";
    let is_relevant = true;
    let ai_analysis_note = "";
    let is_duplicate = false;
    let location_integrity = "Verified";

    // AI Classification — runs before saving to DB
    const aiResult = await classifyIssue(description, location, image_url);

    if (aiResult) {
      // 1. GATEKEEPING: Check if the submission is relevant
      if (aiResult.is_relevant === false) {
        return res.status(400).json({
          error: 'Irrelevant Content Detected',
          message: 'The content submitted does not appear to be campus infrastructure or a maintenance issue.',
          note: aiResult.ai_analysis_note
        });
      }

      // 2. ENRICHMENT: Fallback description and role assignment
      category = aiResult.category || category;
      priority = aiResult.priority || priority;
      department = aiResult.department || department;
      ai_analysis_note = aiResult.ai_analysis_note || "";
      is_duplicate = aiResult.is_duplicate || false;
      location_integrity = aiResult.location_integrity || "Verified";

      // If user typed nothing, use AI generated description
      if (!finalDescription.trim()) {
        finalDescription = aiResult.generated_description || "Issue identified by AI from image.";
      }
    } else if (!description) {
      // Fallback if AI fails AND there's no description
      return res.status(400).json({ error: 'Please provide a description or a clear image.' });
    }

    const newComplaint = new Complaint({
      user_id: user_id || "anonymous",
      location,
      description: finalDescription,
      image_url: image_url || null,
      category,
      priority,
      department,
      is_relevant: true,
      ai_analysis_note,
      is_duplicate,
      location_integrity
    });

    const savedComplaint = await newComplaint.save();

    // ── AI Recurrence Detection (background, does not block the response) ──
    // Fire-and-forget: find recent similar complaints and check for recurrence
    (async () => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentComplaints = await Complaint.find({
          _id: { $ne: savedComplaint._id },
          created_at: { $gte: thirtyDaysAgo },
          location: { $regex: new RegExp(location.split(' ')[0], 'i') }
        }).limit(15);

        const recurrenceResult = await detectRecurrence(savedComplaint, recentComplaints);

        if (recurrenceResult) {
          await Complaint.findByIdAndUpdate(savedComplaint._id, {
            is_recurring: recurrenceResult.is_recurring,
            is_duplicate: recurrenceResult.is_duplicate,
            location_mismatch: recurrenceResult.location_mismatch,
            recurrence_note: recurrenceResult.recurrence_note
          });
          console.log(`🔁 AI Analysis completed for complaint ${savedComplaint._id}`);
        }
      } catch (err) {
        console.error('Recurrence detection background error:', err.message);
      }
    })();

    res.status(201).json({
      message: 'Complaint created successfully',
      data: savedComplaint
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: 'Server error while creating complaint' });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Public (for MVP)
const getComplaints = async (req, res) => {
  try {
    const { user_id } = req.query;
    const filter = user_id ? { user_id } : {};

    const complaints = await Complaint.find(filter).sort({ created_at: -1 });
    res.status(200).json({ count: complaints.length, data: complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Server error while fetching complaints' });
  }
};

// @desc    Link Guest complaints to a User account
// @route   POST /api/complaints/link
// @access  Public (called after login/signup)
const linkComplaints = async (req, res) => {
  try {
    const { sessionId, user_uid } = req.body;
    if (!sessionId || !user_uid) {
      return res.status(400).json({ error: 'Session ID and User UID are required' });
    }

    const result = await Complaint.updateMany(
      { user_id: sessionId },
      { $set: { user_id: user_uid } }
    );

    res.status(200).json({
      message: 'Complaints linked successfully',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error linking complaints:', error);
    res.status(500).json({ error: 'Server error while linking complaints' });
  }
};

// @desc    Preview AI Classification for frontend
// @route   POST /api/complaints/classify
// @access  Public
const previewClassification = async (req, res) => {
  try {
    const { image_url } = req.body;
    if (!image_url) {
      return res.status(400).json({ error: 'Image is required for classification.' });
    }

    const aiResult = await classifyIssue("", "General Property", image_url);
    if (!aiResult) {
      return res.status(500).json({ error: 'AI classification failed' });
    }

    res.status(200).json(aiResult);
  } catch (error) {
    console.error('Preview classification error:', error);
    res.status(500).json({ error: 'Server error during classification preview' });
  }
};

module.exports = { createComplaint, getComplaints, linkComplaints, previewClassification };

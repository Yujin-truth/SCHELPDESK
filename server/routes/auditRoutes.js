const express = require('express');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Log an action (download, acknowledge, etc.)
router.post('/', protect, async (req, res, next) => {
  try {
    const { action, resource } = req.body;
    if (!action || !resource) {
      return res.status(400).json({ message: 'Action and resource are required' });
    }

    const log = await AuditLog.create({
      action,
      user: req.user._id,
      resource,
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

// Get audit logs (admin only)
router.get('/', protect, require('../middleware/authMiddleware').requireRole('admin'), async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
const express = require('express');
const { AuditLog, User } = require('../models');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Log an action (download, acknowledge, etc.)
router.post('/', protect, async (req, res, next) => {
  try {
    const { action, resource } = req.body;
    if (!action || !resource) {
      return res.status(400).json({ success: false, message: 'Action and resource are required' });
    }

    const log = await AuditLog.create({
      action,
      userId: req.user.id,
      resource,
    });
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
});

// Get audit logs (admin only)
router.get('/', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
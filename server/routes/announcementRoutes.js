const express = require('express');
const { Announcement, User } = require('../models');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all announcements
router.get('/', protect, async (req, res, next) => {
  try {
    const announcements = await Announcement.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name'],
        },
      ],
    });
    res.json({ success: true, data: announcements });
  } catch (err) {
    next(err);
  }
});

// Create announcement (admin only)
router.post('/', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const announcement = await Announcement.create({
      title,
      message,
      createdById: req.user.id,
    });
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
});

// Update announcement (admin only)
router.put('/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, message } = req.body;
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    await announcement.update({ title, message });
    res.json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
});

// Delete announcement (admin only)
router.delete('/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    await announcement.destroy();
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
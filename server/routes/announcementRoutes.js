const express = require('express');
const Announcement = require('../models/Announcement');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all announcements
router.get('/', protect, async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');
    res.json(announcements);
  } catch (err) {
    next(err);
  }
});

// Create announcement (admin only)
router.post('/', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: req.user._id,
    });
    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
});

// Update announcement (admin only)
router.put('/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, message } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, message },
      { new: true, runValidators: true }
    );
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (err) {
    next(err);
  }
});

// Delete announcement (admin only)
router.delete('/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
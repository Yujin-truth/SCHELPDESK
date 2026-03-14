const express = require('express');
const Handbook = require('../models/Handbook');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all handbook entries (students and staff)
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const handbooks = await Handbook.find(query).sort({ createdAt: -1 });
    res.json(handbooks);
  } catch (err) {
    next(err);
  }
});

// Get handbook by ID
router.get('/:id', protect, async (req, res, next) => {
  try {
    const handbook = await Handbook.findById(req.params.id);
    if (!handbook) {
      return res.status(404).json({ message: 'Handbook entry not found' });
    }
    res.json(handbook);
  } catch (err) {
    next(err);
  }
});

// Create handbook entry (admin only)
router.post('/', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, category, content } = req.body;
    if (!title || !category || !content) {
      return res.status(400).json({ message: 'Title, category, and content are required' });
    }

    const handbook = await Handbook.create({ title, category, content });
    res.status(201).json(handbook);
  } catch (err) {
    next(err);
  }
});

// Update handbook entry (admin only)
router.put('/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, category, content } = req.body;
    const handbook = await Handbook.findByIdAndUpdate(
      req.params.id,
      { title, category, content },
      { new: true, runValidators: true }
    );
    if (!handbook) {
      return res.status(404).json({ message: 'Handbook entry not found' });
    }
    res.json(handbook);
  } catch (err) {
    next(err);
  }
});

// Delete handbook entry (admin only)
router.delete('/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const handbook = await Handbook.findByIdAndDelete(req.params.id);
    if (!handbook) {
      return res.status(404).json({ message: 'Handbook entry not found' });
    }
    res.json({ message: 'Handbook entry deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
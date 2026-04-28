const express = require('express');
const { Handbook } = require('../models');
const { Op } = require('sequelize');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all handbook entries (students and staff)
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let where = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const handbooks = await Handbook.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: handbooks });
  } catch (err) {
    next(err);
  }
});

// Get handbook by ID
router.get('/:id', protect, async (req, res, next) => {
  try {
    const handbook = await Handbook.findByPk(req.params.id);
    if (!handbook) {
      return res.status(404).json({ success: false, message: 'Handbook entry not found' });
    }
    res.json({ success: true, data: handbook });
  } catch (err) {
    next(err);
  }
});

// Create handbook entry (admin only)
router.post('/', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, category, content } = req.body;
    if (!title || !category || !content) {
      return res.status(400).json({ success: false, message: 'Title, category, and content are required' });
    }

    const handbook = await Handbook.create({ title, category, content });
    res.status(201).json({ success: true, data: handbook });
  } catch (err) {
    next(err);
  }
});

// Update handbook entry (admin only)
router.put('/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, category, content } = req.body;
    const handbook = await Handbook.findByPk(req.params.id);
    if (!handbook) {
      return res.status(404).json({ success: false, message: 'Handbook entry not found' });
    }
    await handbook.update({ title, category, content });
    res.json({ success: true, data: handbook });
  } catch (err) {
    next(err);
  }
});

// Delete handbook entry (admin only)
router.delete('/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const handbook = await Handbook.findByPk(req.params.id);
    if (!handbook) {
      return res.status(404).json({ success: false, message: 'Handbook entry not found' });
    }
    await handbook.destroy();
    res.json({ success: true, message: 'Handbook entry deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
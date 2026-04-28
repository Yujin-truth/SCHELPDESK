const express = require('express');
const { FAQ, User } = require('../models');
const { Op } = require('sequelize');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all FAQs (admin/staff only)
router.get('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const faqs = await FAQ.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.json({ success: true, data: faqs });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ success: false, message: 'Error fetching FAQs' });
  }
});

// Get active FAQs (public)
router.get('/active', async (req, res, next) => {
  try {
    const faqs = await FAQ.findAll({
      where: { isActive: true },
      attributes: ['id', 'question', 'answer', 'category', 'keywords', 'usageCount'],
      order: [['usageCount', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json({ success: true, data: faqs });
  } catch (error) {
    console.error('Get active FAQs error:', error);
    res.status(500).json({ success: false, message: 'Error fetching FAQs' });
  }
});

// Create FAQ (admin/staff only)
router.post('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { question, answer, category, keywords } = req.body;

    if (!question || !answer || !category) {
      return res.status(400).json({ success: false, message: 'Question, answer, and category are required' });
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      category,
      keywords: keywords ? keywords.map(k => k.trim().toLowerCase()) : [],
      createdById: req.user.id
    });

    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ success: false, message: 'Error creating FAQ' });
  }
});

// Update FAQ (admin/staff only)
router.put('/:id', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { question, answer, category, keywords, isActive } = req.body;

    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    const updates = {};
    if (question) updates.question = question.trim();
    if (answer) updates.answer = answer.trim();
    if (category) updates.category = category;
    if (keywords) updates.keywords = keywords.map(k => k.trim().toLowerCase());
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    await faq.update(updates);

    res.json({ success: true, data: faq });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ success: false, message: 'Error updating FAQ' });
  }
});

// Delete FAQ (admin only)
router.delete('/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    await faq.destroy();

    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ success: false, message: 'Error deleting FAQ' });
  }
});

// Get FAQ statistics (admin/staff only)
router.get('/stats/overview', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const totalFaqs = await FAQ.count();
    const activeFaqs = await FAQ.count({ where: { isActive: true } });

    const categoryStats = await FAQ.findAll({
      attributes: ['category', [FAQ.sequelize.fn('COUNT', FAQ.sequelize.col('id')), 'count']],
      where: { isActive: true },
      group: ['category'],
      raw: true,
    });

    const topUsed = await FAQ.findAll({
      where: { isActive: true },
      attributes: ['id', 'question', 'usageCount', 'category'],
      order: [['usageCount', 'DESC']],
      limit: 5,
    });

    res.json({ success: true, data: {
      total: totalFaqs,
      active: activeFaqs,
      categories: categoryStats,
      topUsed
    }});
  } catch (error) {
    console.error('FAQ stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching FAQ statistics' });
  }
});

module.exports = router;
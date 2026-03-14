const express = require('express');
const FAQ = require('../models/FAQ');
const { protect } = require('../middleware/authMiddleware'); // <-- fixed import

const router = express.Router();

// Get all FAQs (admin/staff only)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const faqs = await FAQ.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(faqs);
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
});

// Get active FAQs (public)
router.get('/active', async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true })
      .select('question answer category keywords')
      .sort({ usageCount: -1, createdAt: -1 });

    res.json(faqs);
  } catch (error) {
    console.error('Get active FAQs error:', error);
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
});

// Create FAQ (admin/staff only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { question, answer, category, keywords } = req.body;

    if (!question || !answer || !category) {
      return res.status(400).json({ message: 'Question, answer, and category are required' });
    }

    const faq = new FAQ({
      question: question.trim(),
      answer: answer.trim(),
      category,
      keywords: keywords ? keywords.map(k => k.trim().toLowerCase()) : [],
      createdBy: req.user.id
    });

    await faq.save();

    const populatedFaq = await FAQ.findById(faq._id).populate('createdBy', 'name email');

    res.status(201).json(populatedFaq);
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ message: 'Error creating FAQ' });
  }
});

// Update FAQ (admin/staff only)
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { question, answer, category, keywords, isActive } = req.body;

    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    if (question) faq.question = question.trim();
    if (answer) faq.answer = answer.trim();
    if (category) faq.category = category;
    if (keywords) faq.keywords = keywords.map(k => k.trim().toLowerCase());
    if (typeof isActive === 'boolean') faq.isActive = isActive;

    await faq.save();

    const populatedFaq = await FAQ.findById(faq._id).populate('createdBy', 'name email');

    res.json(populatedFaq);
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ message: 'Error updating FAQ' });
  }
});

// Delete FAQ (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await FAQ.findByIdAndDelete(req.params.id);

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ message: 'Error deleting FAQ' });
  }
});

// Get FAQ statistics (admin/staff only)
router.get('/stats/overview', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalFaqs = await FAQ.countDocuments();
    const activeFaqs = await FAQ.countDocuments({ isActive: true });
    const categoryStats = await FAQ.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const topUsed = await FAQ.find({ isActive: true })
      .sort({ usageCount: -1 })
      .limit(5)
      .select('question usageCount category');

    res.json({
      total: totalFaqs,
      active: activeFaqs,
      categories: categoryStats,
      topUsed
    });
  } catch (error) {
    console.error('FAQ stats error:', error);
    res.status(500).json({ message: 'Error fetching FAQ statistics' });
  }
});

module.exports = router;
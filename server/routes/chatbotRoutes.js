const express = require('express');
const FAQ = require('../models/FAQ');
const Handbook = require('../models/Handbook');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Simple text similarity function (cosine similarity approximation)
function calculateSimilarity(text1, text2) {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

// Smart FAQ matching
 router.post('/ask', protect, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Search FAQs with text matching
    const faqs = await FAQ.find({
      isActive: true,
      $or: [
        { question: { $regex: question, $options: 'i' } },
        { answer: { $regex: question, $options: 'i' } },
        { keywords: { $in: question.toLowerCase().split(/\s+/) } }
      ]
    }).limit(10);

    // Calculate similarity scores
    const scoredFaqs = faqs.map(faq => ({
      ...faq.toObject(),
      similarity: calculateSimilarity(question, faq.question)
    }));

    // Sort by similarity
    scoredFaqs.sort((a, b) => b.similarity - a.similarity);

    // Return best match if similarity is above threshold
    if (scoredFaqs.length > 0 && scoredFaqs[0].similarity > 0.1) {
      const bestMatch = scoredFaqs[0];

      // Increment usage count
      await FAQ.findByIdAndUpdate(bestMatch._id, { $inc: { usageCount: 1 } });

      return res.json({
        type: 'faq_match',
        confidence: bestMatch.similarity,
        answer: bestMatch.answer,
        category: bestMatch.category,
        faqId: bestMatch._id
      });
    }

    // If no good FAQ match, check handbook
    const handbooks = await Handbook.find({
      $or: [
        { title: { $regex: question, $options: 'i' } },
        { content: { $regex: question, $options: 'i' } }
      ]
    }).limit(5);

    if (handbooks.length > 0) {
      const handbookMatch = handbooks[0];
      return res.json({
        type: 'handbook_match',
        title: handbookMatch.title,
        content: handbookMatch.content.substring(0, 500) + '...',
        handbookId: handbookMatch._id
      });
    }

    // If no matches found, suggest creating a ticket
    res.json({
      type: 'no_match',
      message: 'I couldn\'t find a direct answer to your question. Would you like to submit a support ticket?',
      suggestions: [
        'Try rephrasing your question',
        'Check the student handbook',
        'Contact your department directly'
      ]
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Error processing your question' });
  }
});

// Get smart suggestions before ticket creation
router.post('/suggest', protect, async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    // Search FAQs and handbook for relevant content
    const faqs = await FAQ.find({
      isActive: true,
      $or: [
        { question: { $regex: description, $options: 'i' } },
        { answer: { $regex: description, $options: 'i' } },
        { keywords: { $in: description.toLowerCase().split(/\s+/) } }
      ]
    }).limit(3);

    const handbooks = await Handbook.find({
      $or: [
        { title: { $regex: description, $options: 'i' } },
        { content: { $regex: description, $options: 'i' } }
      ]
    }).limit(2);

    const suggestions = [];

    faqs.forEach(faq => {
      suggestions.push({
        type: 'faq',
        title: faq.question,
        content: faq.answer,
        category: faq.category
      });
    });

    handbooks.forEach(handbook => {
      suggestions.push({
        type: 'handbook',
        title: handbook.title,
        content: handbook.content.substring(0, 300) + '...'
      });
    });

    res.json({ suggestions });

  } catch (error) {
    console.error('Suggestion error:', error);
    res.status(500).json({ message: 'Error generating suggestions' });
  }
});

// Classify ticket category (simple rule-based for now)
router.post('/classify', protect, async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const text = description.toLowerCase();

    // Simple keyword-based classification
    const categories = {
      'ICT Support': ['wifi', 'internet', 'computer', 'laptop', 'network', 'email', 'portal', 'login', 'password', 'system', 'software', 'hardware'],
      'Hostel Maintenance': ['hostel', 'room', 'maintenance', 'electricity', 'water', 'heating', 'cleaning', 'furniture', 'lock', 'key'],
      'Academic Affairs': ['course', 'registration', 'timetable', 'grade', 'transcript', 'academic', 'advisor', 'enrollment', 'credit', 'semester'],
      'Finance Office': ['fee', 'payment', 'tuition', 'financial', 'bursary', 'scholarship', 'refund', 'invoice', 'account', 'money'],
      'Examinations': ['exam', 'test', 'assessment', 'result', 'mark', 'grade', 'supplementary', 'resit', 'timetable', 'venue'],
      'Registration': ['register', 'enroll', 'admission', 'application', 'document', 'verification', 'clearance', 'orientation']
    };

    let bestCategory = 'General Inquiry';
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }

    res.json({
      category: bestCategory,
      confidence: maxMatches > 0 ? Math.min(maxMatches / 3, 1) : 0
    });

  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ message: 'Error classifying ticket' });
  }
});

module.exports = router;
const express = require('express');
const { FAQ, Handbook } = require('../models');
const { Op } = require('sequelize');
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

// Enhanced keyword matching for JSON keywords array
function checkKeywordMatch(userKeywords, faqKeywordsArray) {
  if (!faqKeywordsArray || !Array.isArray(faqKeywordsArray)) return 0;
  
  let matches = 0;
  for (const userKw of userKeywords) {
    for (const faqKw of faqKeywordsArray) {
      if (faqKw.includes(userKw) || userKw.includes(faqKw)) {
        matches++;
        break; // Count each FAQ keyword only once
      }
    }
  }
  return matches;
}

// Smart FAQ matching
router.post('/ask', protect, async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    // Get all active FAQs
    const faqs = await FAQ.findAll({
      where: { isActive: true },
      limit: 20,
    });

    if (faqs.length === 0) {
      return res.json({
        success: true,
        type: 'no_match',
        message: 'I couldn\'t find a direct answer to your question. Would you like to submit a support ticket?',
        suggestions: ['Try rephrasing your question', 'Contact support directly']
      });
    }

    // Extract keywords from question (filter words > 2 chars)
    const userKeywords = question.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    
    // Score all FAQs
    const scoredFaqs = faqs.map(faq => {
      // Base similarity on question text
      let similarity = calculateSimilarity(question, faq.question);
      
      // Boost score for answer matching
      const answerSimilarity = calculateSimilarity(question, faq.answer);
      if (answerSimilarity > similarity) {
        similarity = (similarity + answerSimilarity) / 2;
      }
      
      // Bonus points for keyword matches
      const faqKeywordsArray = Array.isArray(faq.keywords) ? faq.keywords : [];
      const keywordMatches = checkKeywordMatch(userKeywords, faqKeywordsArray);
      similarity += (keywordMatches * 0.15);
      
      return {
        ...faq.toJSON(),
        similarity: Math.min(similarity, 1.0)
      };
    });

    // Sort by similarity (highest first)
    scoredFaqs.sort((a, b) => b.similarity - a.similarity);

    // Log for debugging
    console.log(`Question: "${question}"`);
    console.log(`Top match: "${scoredFaqs[0].question}" (similarity: ${scoredFaqs[0].similarity.toFixed(3)})`);

    // Return best match if similarity is above threshold (lowered to 0.15)
    if (scoredFaqs.length > 0 && scoredFaqs[0].similarity > 0.15) {
      const bestMatch = scoredFaqs[0];

      // Increment usage count
      await FAQ.increment('usageCount', { where: { id: bestMatch.id } });

      return res.json({
        success: true,
        type: 'faq_match',
        confidence: bestMatch.similarity,
        answer: bestMatch.answer,
        category: bestMatch.category,
        faqId: bestMatch.id
      });
    }

    // If no good FAQ match, check handbook
    const handbooks = await Handbook.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${question}%` } },
          { content: { [Op.iLike]: `%${question}%` } }
        ]
      },
      limit: 5,
    });

    if (handbooks.length > 0) {
      const handbookMatch = handbooks[0];
      return res.json({
        success: true,
        type: 'handbook_match',
        title: handbookMatch.title,
        content: handbookMatch.content.substring(0, 500) + '...',
        handbookId: handbookMatch.id
      });
    }

    // If no matches found, suggest creating a ticket
    res.json({
      success: true,
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
    res.status(500).json({ success: false, message: 'Error processing your question' });
  }
});

// Get smart suggestions before ticket creation
router.post('/suggest', protect, async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length === 0) {
      return res.json({ success: true, suggestions: [] });
    }

    // Extract keywords from description (improved keyword extraction)
    const keywords = description.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    
    // Search FAQs with improved keyword matching
    const faqs = await FAQ.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { question: { [Op.iLike]: `%${description}%` } },
          { answer: { [Op.iLike]: `%${description}%` } },
          ...keywords.map(k => ({ keywords: { [Op.contains]: [k] } })),
        ]
      },
      limit: 5,
    });

    // Calculate similarity scores for FAQs
    const scoredFaqs = faqs.map(faq => {
      let similarity = calculateSimilarity(description, faq.question);
      
      // Boost score if keywords match
      const faqKeywords = faq.keywords || [];
      const matchingKeywords = keywords.filter(k => 
        faqKeywords.some(fk => fk.includes(k) || k.includes(fk))
      );
      similarity += (matchingKeywords.length * 0.15);
      
      return {
        type: 'faq',
        title: faq.question,
        content: faq.answer,
        category: faq.category,
        similarity: Math.min(similarity, 1.0)
      };
    });

    // Search handbooks for relevant content
    const handbooks = await Handbook.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${description}%` } },
          { content: { [Op.iLike]: `%${description}%` } }
        ]
      },
      limit: 3,
    });

    // Calculate similarity scores for handbooks
    const scoredHandbooks = handbooks.map(handbook => {
      const similarity = calculateSimilarity(description, handbook.title);
      return {
        type: 'handbook',
        title: handbook.title,
        content: handbook.content.substring(0, 300) + '...',
        similarity: similarity
      };
    });

    // Combine and sort by relevance (similarity score)
    const allSuggestions = [...scoredFaqs, ...scoredHandbooks]
      .sort((a, b) => b.similarity - a.similarity)
      .filter(s => s.similarity > 0.15) // Only include relevant suggestions
      .slice(0, 5); // Limit to top 5 suggestions

    res.json({ success: true, suggestions: allSuggestions });

  } catch (error) {
    console.error('Suggestion error:', error);
    res.status(500).json({ success: false, message: 'Error generating suggestions' });
  }
});

// Classify ticket category (simple rule-based for now)
router.post('/classify', protect, async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ success: false, message: 'Description is required' });
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
      success: true,
      category: bestCategory,
      confidence: maxMatches > 0 ? Math.min(maxMatches / 3, 1) : 0
    });

  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ success: false, message: 'Error classifying ticket' });
  }
});

module.exports = router;
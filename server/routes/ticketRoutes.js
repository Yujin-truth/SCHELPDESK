const express = require('express');
const Ticket = require('../models/Ticket');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a ticket with smart classification (Student)
router.post('/', protect, requireRole('student'), async (req, res, next) => {
  try {
    const { title, description, category, skipSuggestions } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // If category not provided, use smart classification
    let finalCategory = category;
    if (!finalCategory) {
      try {
        const response = await fetch(`${process.env.BASE_URL || 'http://localhost:5000'}/api/chatbot/classify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization
          },
          body: JSON.stringify({ description })
        });
        const classification = await response.json();
        finalCategory = classification.category;
      } catch (error) {
        console.error('Classification error:', error);
        finalCategory = 'General Inquiry';
      }
    }

    const ticket = await Ticket.create({
      title,
      description,
      category: finalCategory,
      student: req.user._id,
    });

    res.status(201).json({
      ticket,
      suggestedCategory: finalCategory,
      message: category ? null : `Ticket categorized as "${finalCategory}" based on your description.`
    });
  } catch (err) {
    next(err);
  }
});

// Get tickets (Student sees own, Staff sees assigned + unassigned, Admin sees all)
router.get('/', protect, async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    let query = {};

    if (role === 'student') {
      query = { student: _id };
    } else if (role === 'staff') {
      query = {
        $or: [{ assignedTo: _id }, { assignedTo: null }],
      };
    }

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .populate('student', 'name email yearOfStudy school admissionNumber dob course')
      .populate('assignedTo', 'name email');

    res.json(tickets);
  } catch (err) {
    next(err);
  }
});

// Assign ticket to self (Staff)
router.put('/:id/assign', protect, requireRole('staff'), async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.assignedTo && ticket.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Ticket already assigned to another staff member' });
    }

    ticket.assignedTo = req.user._id;
    if (ticket.status === 'open') {
      ticket.status = 'in progress';
    }
    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate('student', 'name email yearOfStudy school admissionNumber dob course')
      .populate('assignedTo', 'name email')
      .exec();

    res.json(populated);
  } catch (err) {
    next(err);
  }
});

// Update ticket status (Staff/Admin)
router.put('/:id/status', protect, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Staff can only update tickets assigned to them
    if (req.user.role === 'staff' && ticket.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this ticket' });
    }

    ticket.status = status;
    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate('student', 'name email yearOfStudy school admissionNumber dob course')
      .populate('assignedTo', 'name email')
      .exec();

    res.json(populated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

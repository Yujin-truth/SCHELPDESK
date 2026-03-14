const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// List all staff (admin only)
router.get('/staff', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password');
    res.json(staff);
  } catch (err) {
    next(err);
  }
});

// Create a staff user (admin only)
router.post('/staff', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: 'staff',
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
});

// Admin ticket overview
router.get('/tickets', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .populate('student', 'name email yearOfStudy school admissionNumber dob course')
      .populate('assignedTo', 'name email');

    res.json(tickets);
  } catch (err) {
    next(err);
  }
});

// Assign ticket to specific staff (Admin only)
router.put('/tickets/:id/assign', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { staffId } = req.body;
    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID is required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if staff exists and is staff role
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'staff') {
      return res.status(400).json({ message: 'Invalid staff member' });
    }

    ticket.assignedTo = staffId;
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

module.exports = router;

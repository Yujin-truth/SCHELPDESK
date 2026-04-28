const express = require('express');
const bcrypt = require('bcryptjs');
const { User, Ticket } = require('../models');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { validateRegister } = require('../middleware/validation');

const router = express.Router();

// List all staff (admin only)
router.get('/staff', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const staff = await User.findAll({
      where: { role: 'staff' },
      attributes: { exclude: ['password'] },
    });
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
});

// Create a staff user (admin only)
router.post('/staff', protect, requireRole('admin'), validateRegister, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: 'staff',
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    next(err);
  }
});

// Admin ticket overview
router.get('/tickets', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const tickets = await Ticket.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'yearOfStudy', 'school', 'admissionNumber', 'dob', 'course'],
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
});

// Assign ticket to specific staff (Admin only)
router.put('/tickets/:id/assign', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { staffId } = req.body;
    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required' });
    }

    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Check if staff exists and is staff role
    const staff = await User.findByPk(staffId);
    if (!staff || staff.role !== 'staff') {
      return res.status(400).json({ success: false, message: 'Invalid staff member' });
    }

    ticket.assignedToId = staffId;
    if (ticket.status === 'open') {
      ticket.status = 'in progress';
    }
    await ticket.save();

    const populated = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'yearOfStudy', 'school', 'admissionNumber', 'dob', 'course'],
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

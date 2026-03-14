const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const createToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Register new user (Student by default)
router.post('/register', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      yearOfStudy,
      school,
      admissionNumber,
      dob,
      course,
      photo,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
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
      role: role || 'student',
      yearOfStudy,
      school,
      admissionNumber,
      dob,
      course,
      photo,
      acknowledgedHandbook: req.body.acknowledgedHandbook || false,
    });

    const token = createToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        yearOfStudy: user.yearOfStudy,
        school: user.school,
        admissionNumber: user.admissionNumber,
        dob: user.dob,
        course: user.course,
        photo: user.photo,
        acknowledgedHandbook: user.acknowledgedHandbook,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        yearOfStudy: user.yearOfStudy,
        school: user.school,
        admissionNumber: user.admissionNumber,
        dob: user.dob,
        course: user.course,
        photo: user.photo,
        acknowledgedHandbook: user.acknowledgedHandbook,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      yearOfStudy: req.user.yearOfStudy,
      school: req.user.school,
      admissionNumber: req.user.admissionNumber,
      dob: req.user.dob,
      course: req.user.course,
      photo: req.user.photo,
      acknowledgedHandbook: req.user.acknowledgedHandbook,
    },
  });
});

// Update current user profile
router.put('/me', protect, async (req, res, next) => {
  try {
    const updates = {
      name: req.body.name,
      admissionNumber: req.body.admissionNumber,
      dob: req.body.dob,
      course: req.body.course,
      school: req.body.school,
      photo: req.body.photo,
      acknowledgedHandbook: req.body.acknowledgedHandbook,
    };

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    // Log handbook acknowledgement
    if (req.body.acknowledgedHandbook === true && !req.user.acknowledgedHandbook) {
      await AuditLog.create({
        action: 'acknowledge',
        user: req.user._id,
        resource: 'handbook',
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        yearOfStudy: user.yearOfStudy,
        school: user.school,
        admissionNumber: user.admissionNumber,
        dob: user.dob,
        course: user.course,
        photo: user.photo,
        acknowledgedHandbook: user.acknowledgedHandbook,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Change password
router.post('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

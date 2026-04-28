const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, AuditLog } = require('../models');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validation');
const rateLimit = require('../middleware/rateLimiter');

const router = express.Router();

// ================= TOKEN =================
const createToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

// ================= REGISTER =================
router.post(
  '/register',
  rateLimit(15 * 60 * 1000, 5),
  validateRegister,
  async (req, res, next) => {
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
        acknowledgedHandbook
      } = req.body;

      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'student',
        yearOfStudy,
        school,
        admissionNumber,
        dob: dob ? new Date(dob) : null,
        course,
        photo,
        acknowledgedHandbook: acknowledgedHandbook || false
      });

      const token = createToken(user);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          yearOfStudy: user.yearOfStudy,
          school: user.school,
          admissionNumber: user.admissionNumber,
          dob: user.dob,
          course: user.course,
          photo: user.photo,
          acknowledgedHandbook: user.acknowledgedHandbook
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// ================= LOGIN =================
router.post(
  '/login',
  rateLimit(15 * 60 * 1000, 20),
  validateLogin,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = createToken(user);

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          yearOfStudy: user.yearOfStudy,
          school: user.school,
          admissionNumber: user.admissionNumber,
          dob: user.dob,
          course: user.course,
          photo: user.photo,
          acknowledgedHandbook: user.acknowledgedHandbook
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// ================= CURRENT USER =================
router.get('/me', protect, async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      yearOfStudy: req.user.yearOfStudy,
      school: req.user.school,
      admissionNumber: req.user.admissionNumber,
      dob: req.user.dob,
      course: req.user.course,
      photo: req.user.photo,
      acknowledgedHandbook: req.user.acknowledgedHandbook
    }
  });
});

// ================= UPDATE PROFILE =================
router.put('/me', protect, async (req, res, next) => {
  try {
    const previous = req.user.acknowledgedHandbook;

    await req.user.update({
      name: req.body.name,
      admissionNumber: req.body.admissionNumber,
      dob: req.body.dob,
      course: req.body.course,
      school: req.body.school,
      photo: req.body.photo,
      acknowledgedHandbook: req.body.acknowledgedHandbook
    });

    if (req.body.acknowledgedHandbook && !previous) {
      await AuditLog.create({
        action: 'acknowledge',
        userId: req.user.id,
        resource: 'handbook'
      });
    }

    return res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
});

// ================= CHANGE PASSWORD =================
router.post('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both fields are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    const match = await bcrypt.compare(currentPassword, req.user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await req.user.update({ password: hashed });

    return res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
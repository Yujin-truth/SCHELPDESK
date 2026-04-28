const express = require('express');
const { Notification } = require('../models');
const { protect } = require('../middleware/authMiddleware');
const { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount 
} = require('../utils/notificationService');

const router = express.Router();

/**
 * Get user's notifications
 */
router.get('/', protect, async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const notifications = await getUserNotifications(req.user.id, parseInt(limit), offset);
    const total = await Notification.count({ where: { userId: req.user.id } });
    const unreadCount = await getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Mark notification as read
 */
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await markAsRead(req.params.id);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Mark all notifications as read
 */
router.put('/all/read', protect, async (req, res, next) => {
  try {
    await markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get unread notification count
 */
router.get('/unread/count', protect, async (req, res, next) => {
  try {
    const count = await getUnreadCount(req.user.id);

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Delete notification
 */
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

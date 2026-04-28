/**
 * Notification Service
 * Handles creation and dispatch of notifications
 */

const nodemailer = require('nodemailer');
const { Notification } = require('../models');

// Configure email transporter (using environment variables)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Create a notification
 */
const createNotification = async (userId, ticketId, type, title, message, sendEmail = true) => {
  try {
    const notification = await Notification.create({
      userId,
      ticketId,
      type,
      title,
      message,
      email: sendEmail
    });

    // Send email if enabled and not in development
    if (sendEmail && process.env.NODE_ENV === 'production') {
      sendEmailNotification(userId, type, title, message).catch(err => 
        console.error('Email notification error:', err)
      );
    }

    return notification;
  } catch (error) {
    console.error('Notification creation error:', error);
    return null;
  }
};

/**
 * Send email notification
 */
const sendEmailNotification = async (userId, type, title, message) => {
  try {
    // Get user email
    const { User } = require('../models');
    const user = await User.findByPk(userId, { attributes: ['email', 'name'] });
    
    if (!user || !user.email) return false;

    const emailTemplates = {
      'ticket_created': {
        subject: 'Your Support Ticket Has Been Created',
        body: (name) => `
          Dear ${name},
          
          Your support ticket has been successfully created. You can track its progress on the system.
          
          ${message}
          
          Best regards,
          Smart Campus Helpdesk
        `
      },
      'ticket_assigned': {
        subject: 'Your Ticket Has Been Assigned',
        body: (name) => `
          Dear ${name},
          
          Your support ticket has been assigned to a staff member and is being worked on.
          
          ${message}
          
          Best regards,
          Smart Campus Helpdesk
        `
      },
      'ticket_updated': {
        subject: 'Your Ticket Has Been Updated',
        body: (name) => `
          Dear ${name},
          
          There is an update on your support ticket.
          
          ${message}
          
          Best regards,
          Smart Campus Helpdesk
        `
      },
      'ticket_resolved': {
        subject: 'Your Ticket Has Been Resolved',
        body: (name) => `
          Dear ${name},
          
          Your support ticket has been resolved. Please review the solution and let us know if you need further assistance.
          
          ${message}
          
          Best regards,
          Smart Campus Helpdesk
        `
      },
      'status_change': {
        subject: 'Ticket Status Changed',
        body: (name) => `
          Dear ${name},
          
          The status of your support ticket has changed.
          
          ${message}
          
          Best regards,
          Smart Campus Helpdesk
        `
      },
      'default': {
        subject: title,
        body: (name) => `
          Dear ${name},
          
          ${message}
          
          Best regards,
          Smart Campus Helpdesk
        `
      }
    };

    const template = emailTemplates[type] || emailTemplates['default'];
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@smartcampus.ac.ke',
      to: user.email,
      subject: template.subject,
      html: template.body(user.name)
    });

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

/**
 * Notify ticket status change
 */
const notifyStatusChange = async (ticket, oldStatus, newStatus, staffName) => {
  const message = `Your ticket status has changed from "${oldStatus}" to "${newStatus}" by ${staffName}.`;
  return createNotification(
    ticket.studentId,
    ticket.id,
    'status_change',
    'Ticket Status Changed',
    message
  );
};

/**
 * Notify ticket assignment
 */
const notifyTicketAssignment = async (ticket, staffName) => {
  const message = `Your ticket has been assigned to ${staffName} for resolution.`;
  return createNotification(
    ticket.studentId,
    ticket.id,
    'ticket_assigned',
    'Ticket Assigned',
    message
  );
};

/**
 * Notify new comment
 */
const notifyNewComment = async (ticket, commenterName, comment) => {
  const message = `${commenterName} added a comment: "${comment.substring(0, 100)}..."`;
  return createNotification(
    ticket.studentId,
    ticket.id,
    'new_comment',
    'New Comment on Ticket',
    message
  );
};

/**
 * Notify ticket resolution
 */
const notifyTicketResolution = async (ticket, resolution) => {
  const message = `Your ticket has been resolved. Details: ${resolution}`;
  return createNotification(
    ticket.studentId,
    ticket.id,
    'ticket_resolved',
    'Ticket Resolved',
    message
  );
};

/**
 * Get user notifications (paginated, unread first)
 */
const getUserNotifications = async (userId, limit = 10, offset = 0) => {
  return await Notification.findAll({
    where: { userId },
    order: [
      ['read', 'ASC'],
      ['createdAt', 'DESC']
    ],
    limit,
    offset
  });
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId) => {
  return await Notification.update(
    { read: true },
    { where: { id: notificationId } }
  );
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  return await Notification.update(
    { read: true },
    { where: { userId, read: false } }
  );
};

/**
 * Get unread count
 */
const getUnreadCount = async (userId) => {
  return await Notification.count({
    where: { userId, read: false }
  });
};

module.exports = {
  createNotification,
  sendEmailNotification,
  notifyStatusChange,
  notifyTicketAssignment,
  notifyNewComment,
  notifyTicketResolution,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};

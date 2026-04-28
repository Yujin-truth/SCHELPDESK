const { sequelize } = require('../config/db');

// Import model factories
const UserFactory = require('./User');
const TicketFactory = require('./Ticket');
const TicketCommentFactory = require('./TicketComment');
const NotificationFactory = require('./Notification');
const FAQFactory = require('./FAQ');
const AnnouncementFactory = require('./Announcement');
const AuditLogFactory = require('./AuditLog');
const HandbookFactory = require('./Handbook');

// Initialize models
const User = UserFactory(sequelize);
const Ticket = TicketFactory(sequelize);
const TicketComment = TicketCommentFactory(sequelize);
const Notification = NotificationFactory(sequelize);
const FAQ = FAQFactory(sequelize);
const Announcement = AnnouncementFactory(sequelize);
const AuditLog = AuditLogFactory(sequelize);
const Handbook = HandbookFactory(sequelize);

// ======================
// USER ↔ TICKET
// ======================

// Student who created ticket
User.hasMany(Ticket, {
  foreignKey: 'studentId',
  as: 'studentTickets',
});

Ticket.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student',
});

// Staff assigned ticket
User.hasMany(Ticket, {
  foreignKey: 'assignedToId',
  as: 'assignedTickets',
});

Ticket.belongsTo(User, {
  foreignKey: 'assignedToId',
  as: 'assignedTo',
});

// ======================
// TICKET COMMENTS
// ======================

User.hasMany(TicketComment, {
  foreignKey: 'userId',
  as: 'comments',
});

TicketComment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
});

Ticket.hasMany(TicketComment, {
  foreignKey: 'ticketId',
  as: 'comments',
  onDelete: 'CASCADE',
});

TicketComment.belongsTo(Ticket, {
  foreignKey: 'ticketId',
  as: 'ticket',
});

// ======================
// NOTIFICATIONS
// ======================

User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
});

Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Ticket.hasMany(Notification, {
  foreignKey: 'ticketId',
  as: 'notifications',
});

Notification.belongsTo(Ticket, {
  foreignKey: 'ticketId',
  as: 'ticket',
});

// ======================
// FAQ
// ======================

User.hasMany(FAQ, {
  foreignKey: 'createdById',
  as: 'createdFAQs',
});

FAQ.belongsTo(User, {
  foreignKey: 'createdById',
  as: 'createdBy',
});

// ======================
// ANNOUNCEMENTS
// ======================

User.hasMany(Announcement, {
  foreignKey: 'createdById',
  as: 'createdAnnouncements',
});

Announcement.belongsTo(User, {
  foreignKey: 'createdById',
  as: 'createdBy',
});

// ======================
// AUDIT LOGS
// ======================

User.hasMany(AuditLog, {
  foreignKey: 'userId',
  as: 'auditLogs',
});

AuditLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// ======================
// EXPORTS
// ======================

module.exports = {
  sequelize,
  User,
  Ticket,
  TicketComment,
  Notification,
  FAQ,
  Announcement,
  AuditLog,
  Handbook,
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Tickets',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM('ticket_created', 'ticket_updated', 'ticket_assigned', 'ticket_resolved', 'status_change', 'new_comment', 'general'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether to send email notification'
    },
  }, {
    timestamps: true,
  });

  return Notification;
};

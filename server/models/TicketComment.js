const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TicketComment = sequelize.define('TicketComment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Tickets',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'userId',
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isInternal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true,
  });

  return TicketComment;
};
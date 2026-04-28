const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FAQ = sequelize.define('FAQ', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        'ICT Support',
        'Hostel Maintenance',
        'Academic Affairs',
        'Finance Office',
        'General Inquiry',
        'Registration',
        'Examinations'
      ),
      allowNull: false,
    },
    keywords: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    timestamps: true,
  });

  return FAQ;
};
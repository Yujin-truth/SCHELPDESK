const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Handbook = sequelize.define('Handbook', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        'Academic Policies',
        'Examination Rules',
        'Hostel Regulations',
        'ICT Policy',
        'Code of Conduct'
      ),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  return Handbook;
};
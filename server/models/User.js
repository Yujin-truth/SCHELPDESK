const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('student', 'staff', 'admin'),
      defaultValue: 'student',
    },
    yearOfStudy: {
      type: DataTypes.STRING,
    },
    admissionNumber: {
      type: DataTypes.STRING,
    },
    dob: {
      type: DataTypes.DATE,
    },
    course: {
      type: DataTypes.STRING,
    },
    photo: {
      type: DataTypes.STRING,
    },
    acknowledgedHandbook: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    school: {
      type: DataTypes.STRING,
    },
  }, {
    timestamps: true,
  });

  return User;
};

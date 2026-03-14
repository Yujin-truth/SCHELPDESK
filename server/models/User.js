const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'staff', 'admin'],
      default: 'student',
    },
    yearOfStudy: {
      type: String,
      trim: true,
    },
    admissionNumber: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
    },
    course: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
    },
    acknowledgedHandbook: {
      type: Boolean,
      default: false,
    },
    school: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);

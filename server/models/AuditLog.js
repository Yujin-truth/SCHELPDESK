const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'download', 'acknowledge'
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: String, required: true }, // e.g., 'Student_Handbook.pdf', 'handbook'
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
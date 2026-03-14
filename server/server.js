require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');
const handbookRoutes = require('./routes/handbookRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const auditRoutes = require('./routes/auditRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const faqRoutes = require('./routes/faqRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/handbook', handbookRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/faqs', faqRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

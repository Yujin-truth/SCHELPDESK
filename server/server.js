require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
const { handleError } = require('./utils/errorHandler');

// Import models to ensure they're registered
require('./models');
const { FAQ, User } = require('./models');

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');
const handbookRoutes = require('./routes/handbookRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const auditRoutes = require('./routes/auditRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const faqRoutes = require('./routes/faqRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportingRoutes = require('./routes/reportingRoutes');

const app = express();

// Validate required environment variables
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'PORT'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName] && varName !== 'DB_NAME' && varName !== 'DB_USER' && varName !== 'DB_PASSWORD') {
    if (!process.env[varName]) {
      console.error(`ERROR: Missing required environment variable: ${varName}`);
      process.exit(1);
    }
  }
});

// Connect to PostgreSQL
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://schelpdesk-1.onrender.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/handbook', handbookRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reporting', reportingRoutes);

// Root route (important for Render)
app.get('/', (req, res) => {
  res.json({ message: 'Helpdesk API is running...', status: 'ok' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler (must be last)
app.use(handleError);

// Seed FAQs if they don't exist
const seedFAQsIfEmpty = async () => {
  try {
    const faqCount = await FAQ.count();
    if (faqCount === 0) {
      console.log('No FAQs found. Seeding initial FAQs...');
      
      // Get or create a system admin user for FAQ creation
      let admin = await User.findOne({ where: { role: 'admin' } });
      if (!admin) {
        // Create a minimal admin user for seeding
        admin = await User.create({
          name: 'System Admin',
          email: 'system-admin@uniassist.local',
          password: 'temp', // This won't work for login due to hashing
          role: 'admin',
          pinCreated: false,
        });
      }

      const faqData = [
        {
          question: "How do I reset my student portal password?",
          answer: "To reset your password: 1) Go to the login page, 2) Click 'Forgot Password', 3) Enter your student email, 4) Check your email for reset instructions, 5) Follow the link to create a new password.",
          category: "ICT Support",
          keywords: ["password", "reset", "login", "portal", "forgot"],
          isActive: true,
          createdById: admin.id
        },
        {
          question: "Why can't I access the campus WiFi?",
          answer: "Common WiFi issues: 1) Ensure you're within campus range, 2) Check if your device is connected to 'UNIASSIST-Guest' or 'UNIASSIST-Student', 3) Try forgetting the network and reconnecting, 4) Contact ICT support if issues persist.",
          category: "ICT Support",
          keywords: ["wifi", "internet", "connection", "network", "campus"],
          isActive: true,
          createdById: admin.id
        },
        {
          question: "How do I report a hostel maintenance issue?",
          answer: "To report maintenance issues: 1) Log into your student dashboard, 2) Go to Tickets section, 3) Select 'Hostel Maintenance' category, 4) Describe the issue in detail with your room number, 5) Submit the ticket.",
          category: "Hostel Maintenance",
          keywords: ["hostel", "maintenance", "repair", "room", "facility"],
          isActive: true,
          createdById: admin.id
        },
        {
          question: "Where can I check my exam timetable?",
          answer: "Exam timetables are available: 1) On the student portal under 'Examinations', 2) Posted on notice boards in academic buildings, 3) Sent via email to your student account, 4) Available from the examinations office.",
          category: "Examinations",
          keywords: ["exam", "timetable", "schedule", "test", "assessment"],
          isActive: true,
          createdById: admin.id
        },
        {
          question: "How do I apply for a student loan or bursary?",
          answer: "For financial aid: 1) Visit the Finance Office, 2) Complete the application form, 3) Submit required documents (ID, proof of income, academic records), 4) Applications are processed within 2-4 weeks.",
          category: "Finance Office",
          keywords: ["loan", "bursary", "financial", "aid", "money", "fees"],
          isActive: true,
          createdById: admin.id
        },
        {
          question: "What should I do if I lose my student ID card?",
          answer: "For lost ID cards: 1) Report immediately to the Registration Office, 2) Bring a recent photo, 3) Pay the replacement fee (R50), 4) New card will be ready within 3 working days.",
          category: "Registration",
          keywords: ["id", "card", "lost", "replacement", "identification"],
          isActive: true, createdById: admin.id
        },
        {
          question: "How do I change my course or major?",
          answer: "Course changes: 1) Consult your academic advisor, 2) Complete the course change form, 3) Get approval from department head, 4) Submit to Academic Affairs office, 5) Changes must be made before registration deadline.",
          category: "Academic Affairs",
          keywords: ["course", "change", "major", "subject", "academic"],
          isActive: true,
          createdById: admin.id
        },
        {
          question: "What are the library opening hours?",
          answer: "Library hours: Monday-Friday: 8:00 AM - 8:00 PM, Saturday: 9:00 AM - 5:00 PM, Sunday: 10:00 AM - 4:00 PM. Special hours during exam periods - check notices.",
          category: "General Inquiry",
          keywords: ["library", "hours", "opening", "time", "study"],
          isActive: true,
          createdById: admin.id
        },
        {
          question: "How do I access my academic results?",
          answer: "Access results: 1) Log into student portal, 2) Go to 'Academic Records', 3) Select 'Results' tab, 4) Choose the semester, 5) Results are released 2 weeks after exam completion.",
          category: "Academic Affairs",
          keywords: ["results", "grades", "marks", "academic", "performance"],
          isActive: true,
          createdById: admin.id
        },
        {
          question: "What is the procedure for academic appeals?",
          answer: "Academic appeals: 1) Submit written appeal within 7 days of result release, 2) Include detailed reasons and supporting evidence, 3) Submit to Academic Appeals Committee, 4) Decision within 14 working days.",
          category: "Academic Affairs",
          keywords: ["appeal", "academic", "results", "complaint", "dispute"],
          isActive: true,
          createdById: admin.id
        }
      ];

      await FAQ.bulkCreate(faqData);
      console.log(`Successfully seeded ${faqData.length} FAQs`);
    }
  } catch (error) {
    console.error('Error seeding FAQs:', error.message);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Seed FAQs on startup
  seedFAQsIfEmpty();
});
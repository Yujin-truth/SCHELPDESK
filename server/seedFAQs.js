require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
const { FAQ, User } = require('./models');

const faqData = [
  {
    question: "How do I reset my student portal password or fix login issues?",
    answer: "To reset your password: 1) Go to the login page, 2) Click 'Forgot Password', 3) Enter your student email, 4) Check your email for reset instructions, 5) Follow the link to create a new password. Password must be at least 8 characters with uppercase, lowercase, number, and special character. If you're still locked out, contact ICT support.",
    category: "ICT Support",
    keywords: ["password", "reset", "login", "portal", "forgot", "account", "locked", "access", "authentication", "credentials", "sign-in", "issue"]
  },
  {
    question: "Why can't I connect to the campus WiFi and how do I fix it?",
    answer: "Common WiFi troubleshooting: 1) Ensure you're within campus range, 2) Look for 'UNIASSIST-Student' or 'UNIASSIST-Guest' network, 3) Check if WiFi is enabled on your device, 4) Try forgetting the network and reconnecting, 5) Restart your device, 6) Clear browser cache if you can't access web pages, 7) Contact ICT support at ict@uniassist.edu if issues persist.",
    category: "ICT Support",
    keywords: ["wifi", "internet", "connection", "network", "campus", "not working", "can't connect", "connectivity", "wireless", "signal", "online", "disconnect"]
  },
  {
    question: "Where can I find my exam timetable and results?",
    answer: "Access exam information: 1) Log into your student portal at https://portal.uniassist.edu, 2) Navigate to 'Examinations' or 'Academic Records', 3) Your exam timetable shows dates, times, and venues, 4) Results are released 2 weeks after exams complete, 5) Check notice boards or your email for announcements, 6) Contact Academic Affairs if timetable is missing.",
    category: "Examinations",
    keywords: ["exam", "timetable", "schedule", "test", "results", "grades", "assessment", "venue", "venue", "date", "time", "marks", "performance"]
  },
  {
    question: "How do I report a hostel or facility maintenance issue?",
    answer: "To report maintenance problems: 1) Log into your student dashboard, 2) Go to 'My Tickets' section, 3) Click 'Create Ticket' and select 'Hostel Maintenance' or 'Facility Issue', 4) Describe the problem clearly with your room/location, 5) Include photos if helpful, 6) Submit - you'll receive a ticket number, 7) Staff will respond within 24-48 hours.",
    category: "Hostel Maintenance",
    keywords: ["hostel", "maintenance", "repair", "room", "facility", "broken", "damage", "issue", "problem", "electricity", "water", "heating", "plumbing"]
  },
  {
    question: "How do I apply for financial aid, bursary, or pay my fees?",
    answer: "Financial assistance and payments: 1) Visit the Finance Office (Building A, 2nd Floor), 2) For aid/bursary: complete application with ID, proof of income, academic records, 3) Processing takes 2-4 weeks, 4) For fee payment: pay online via student portal or at Finance office, 5) Request payment plan if needed, 6) Contact Finance at finance@uniassist.edu for queries.",
    category: "Finance Office",
    keywords: ["loan", "bursary", "financial", "aid", "money", "fees", "payment", "grant", "tuition", "scholarship", "subsidy", "cost", "invoice", "account"]
  },
  {
    question: "What do I do if I lose my student ID card or need a replacement?",
    answer: "For lost or damaged ID cards: 1) Report immediately to the Registration Office (Student Centre, Ground Floor), 2) Bring a recent photo (passport size), 3) Pay replacement fee of R50 or equivalent, 4) New card will be ready within 3 working days, 5) Use temporary ID if urgent, 6) Contact Registration at registration@uniassist.edu if you have questions.",
    category: "Registration",
    keywords: ["id", "card", "lost", "replacement", "damaged", "identification", "student", "number", "duplicate"]
  }
];


async function seedFAQs() {
  try {
    await connectDB();
    console.log('Connected to PostgreSQL');

    // Find admin user or create one
    let admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      console.log('No admin user found. Creating one...');
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@helpdesk.local',
        password: 'temp-password',
        role: 'admin',
      });
    }

    // Clear existing FAQs
    await FAQ.destroy({ where: {} });
    console.log('Cleared existing FAQs');

    // Add createdById to each FAQ entry
    const faqsWithAdmin = faqData.map(faq => ({
      ...faq,
      createdById: admin.id,
    }));

    // Create new FAQs
    const createdFAQs = await FAQ.bulkCreate(faqsWithAdmin);
    console.log(`Seeded ${createdFAQs.length} FAQs`);

    console.log('FAQ seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding FAQs:', error);
    process.exit(1);
  }
}

seedFAQs();
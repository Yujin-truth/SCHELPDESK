const mongoose = require('mongoose');
const FAQ = require('./models/FAQ');
require('dotenv').config();

const faqData = [
  {
    question: "How do I reset my student portal password?",
    answer: "To reset your password: 1) Go to the login page, 2) Click 'Forgot Password', 3) Enter your student email, 4) Check your email for reset instructions, 5) Follow the link to create a new password.",
    category: "ICT Support",
    keywords: ["password", "reset", "login", "portal", "forgot"]
  },
  {
    question: "Why can't I access the campus WiFi?",
    answer: "Common WiFi issues: 1) Ensure you're within campus range, 2) Check if your device is connected to 'UNIASSIST-Guest' or 'UNIASSIST-Student', 3) Try forgetting the network and reconnecting, 4) Contact ICT support if issues persist.",
    category: "ICT Support",
    keywords: ["wifi", "internet", "connection", "network", "campus"]
  },
  {
    question: "How do I report a hostel maintenance issue?",
    answer: "To report maintenance issues: 1) Log into your student dashboard, 2) Go to Tickets section, 3) Select 'Hostel Maintenance' category, 4) Describe the issue in detail with your room number, 5) Submit the ticket.",
    category: "Hostel Maintenance",
    keywords: ["hostel", "maintenance", "repair", "room", "facility"]
  },
  {
    question: "Where can I check my exam timetable?",
    answer: "Exam timetables are available: 1) On the student portal under 'Examinations', 2) Posted on notice boards in academic buildings, 3) Sent via email to your student account, 4) Available from the examinations office.",
    category: "Examinations",
    keywords: ["exam", "timetable", "schedule", "test", "assessment"]
  },
  {
    question: "How do I apply for a student loan or bursary?",
    answer: "For financial aid: 1) Visit the Finance Office, 2) Complete the application form, 3) Submit required documents (ID, proof of income, academic records), 4) Applications are processed within 2-4 weeks.",
    category: "Finance Office",
    keywords: ["loan", "bursary", "financial", "aid", "money", "fees"]
  },
  {
    question: "What should I do if I lose my student ID card?",
    answer: "For lost ID cards: 1) Report immediately to the Registration Office, 2) Bring a recent photo, 3) Pay the replacement fee (R50), 4) New card will be ready within 3 working days.",
    category: "Registration",
    keywords: ["id", "card", "lost", "replacement", "identification"]
  },
  {
    question: "How do I change my course or major?",
    answer: "Course changes: 1) Consult your academic advisor, 2) Complete the course change form, 3) Get approval from department head, 4) Submit to Academic Affairs office, 5) Changes must be made before registration deadline.",
    category: "Academic Affairs",
    keywords: ["course", "change", "major", "subject", "academic"]
  },
  {
    question: "What are the library opening hours?",
    answer: "Library hours: Monday-Friday: 8:00 AM - 8:00 PM, Saturday: 9:00 AM - 5:00 PM, Sunday: 10:00 AM - 4:00 PM. Special hours during exam periods - check notices.",
    category: "General Inquiry",
    keywords: ["library", "hours", "opening", "time", "study"]
  },
  {
    question: "How do I access my academic results?",
    answer: "Access results: 1) Log into student portal, 2) Go to 'Academic Records', 3) Select 'Results' tab, 4) Choose the semester, 5) Results are released 2 weeks after exam completion.",
    category: "Academic Affairs",
    keywords: ["results", "grades", "marks", "academic", "performance"]
  },
  {
    question: "What is the procedure for academic appeals?",
    answer: "Academic appeals: 1) Submit written appeal within 7 days of result release, 2) Include detailed reasons and supporting evidence, 3) Submit to Academic Appeals Committee, 4) Decision within 14 working days.",
    category: "Academic Affairs",
    keywords: ["appeal", "academic", "results", "complaint", "dispute"]
  }
];

async function seedFAQs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing FAQs
    await FAQ.deleteMany({});
    console.log('Cleared existing FAQs');

    // Insert new FAQs
    const createdFAQs = await FAQ.insertMany(faqData);
    console.log(`Seeded ${createdFAQs.length} FAQs`);

    console.log('FAQ seeding completed successfully');
  } catch (error) {
    console.error('Error seeding FAQs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedFAQs();
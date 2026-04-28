/**
 * Machine Learning Classification Service
 * Performs ticket categorization and urgency prediction
 */

const categorizeTicket = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  // Define keywords for each category
  const categories = {
    'ICT Support': [
      'computer', 'laptop', 'desktop', 'server', 'network', 'internet', 'wifi',
      'password', 'account', 'email', 'software', 'hardware', 'printer', 'vpn',
      'database', 'system', 'crash', 'error', 'bug', 'code', 'application',
      'operating system', 'installation', 'configuration', 'access', 'login'
    ],
    'Maintenance': [
      'repair', 'fix', 'broken', 'damage', 'maintenance', 'clean', 'painting',
      'plumbing', 'electrical', 'roof', 'floor', 'wall', 'door', 'window',
      'furniture', 'equipment', 'facility', 'building', 'construction'
    ],
    'Academic': [
      'course', 'grade', 'assignment', 'exam', 'test', 'pass', 'fail',
      'transcript', 'academic', 'degree', 'module', 'lecture', 'tutorial',
      'study', 'curriculum', 'prerequisite', 'credit', 'registration'
    ],
    'Administrative': [
      'document', 'certificate', 'fee', 'payment', 'tuition', 'scholarship',
      'admission', 'enrollment', 'registration', 'visa', 'accommodation',
      'hostel', 'travel', 'permit', 'application', 'form', 'official'
    ],
    'Library': [
      'book', 'borrowed', 'return', 'library', 'fine', 'renewal', 'catalog',
      'reference', 'research', 'database', 'journal', 'publication', 'archive'
    ],
    'Student Services': [
      'counseling', 'health', 'medical', 'wellbeing', 'mental health', 'care',
      'welfare', 'support', 'advisor', 'mentor', 'guidance', 'help'
    ]
  };

  // Count keyword matches for each category
  const scores = {};
  for (const [category, keywords] of Object.entries(categories)) {
    scores[category] = keywords.filter(keyword => text.includes(keyword)).length;
  }

  // Find category with highest score
  const predicted = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return predicted ? predicted[0] : 'General Inquiry';
};

const predictUrgency = (title, description, category) => {
  const text = `${title} ${description}`.toLowerCase();
  
  let urgency = 5; // Base score
  
  // Keywords indicating high urgency
  const criticalKeywords = ['urgent', 'critical', 'emergency', 'asap', 'immediately', 'down', 'broken', 'crash', 'urgent', 'severe'];
  const highKeywords = ['important', 'high priority', 'asap', 'quickly', 'soon', 'important', 'significant'];
  const lowKeywords = ['when possible', 'no rush', 'minor', 'cosmetic', 'suggestion', 'enhancement'];
  
  for (const keyword of criticalKeywords) {
    if (text.includes(keyword)) {
      urgency = 10;
      break;
    }
  }
  
  for (const keyword of highKeywords) {
    if (text.includes(keyword) && urgency < 8) {
      urgency = 8;
    }
  }
  
  for (const keyword of lowKeywords) {
    if (text.includes(keyword)) {
      urgency = Math.min(urgency, 3);
    }
  }
  
  // Adjust based on category
  if (category === 'ICT Support' && text.includes('server')) urgency = Math.max(urgency, 9);
  if (category === 'Maintenance' && text.includes('safety')) urgency = 10;
  if (category === 'Student Services' && text.includes('emergency')) urgency = 10;
  
  return Math.max(1, Math.min(10, urgency));
};

const routeTicketToDepartment = (category) => {
  const departmentMap = {
    'ICT Support': 'ICT Department',
    'Maintenance': 'Facilities Department',
    'Academic': 'Academic Affairs',
    'Administrative': 'Student Affairs Office',
    'Library': 'Library Services',
    'Student Services': 'Student Support Services',
    'General Inquiry': 'General Support'
  };
  
  return departmentMap[category] || 'General Support';
};

module.exports = {
  categorizeTicket,
  predictUrgency,
  routeTicketToDepartment
};

// Request validation middleware
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  // Password complexity: must have uppercase, lowercase, number, special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)',
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  next();
};

const validateTicket = (req, res, next) => {
  const { title, description, category } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    return res.status(400).json({ message: 'Title must be at least 5 characters' });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return res.status(400).json({ message: 'Description must be at least 10 characters' });
  }

  if (!category || typeof category !== 'string' || category.trim().length < 2) {
    return res.status(400).json({ message: 'Category is required' });
  }

  next();
};

const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1) {
    return res.status(400).json({ message: 'Page must be at least 1' });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({ message: 'Limit must be between 1 and 100' });
  }

  req.pagination = { page, limit };
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTicket,
  validatePagination,
};

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [userType, setUserType] = useState(null); // null, 'student', 'staff'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/auth/login', { email, password });
      const user = res.data.user;
      const role = user?.role;

      // Validate that the user type matches their role
      if (userType === 'staff' && !['admin', 'staff'].includes(role)) {
        setError('Access denied. This login is for administrators and staff only.');
        return;
      }

      if (userType === 'student' && role !== 'student') {
        setError('Access denied. This login is for students only.');
        return;
      }

      login(res.data);

      if (role === 'staff') {
        navigate('/staff');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleBack = () => {
    setUserType(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  if (userType === 'student') {
    return (
      <div className="student-login-page">
        <div className="student-login-container">
          <div className="student-login-left">
            <div className="student-login-illustration">
              <div className="illustration-content">
                <div className="university-icon">🎓</div>
                <h2>Welcome Back!</h2>
                <p>Access your university support portal</p>
                <div className="illustration-features">
                  <div className="feature-item">
                    <span className="feature-icon">📋</span>
                    <span>Submit Support Tickets</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📢</span>
                    <span>View Announcements</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📚</span>
                    <span>Access Resources</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="student-login-right">
            <div className="student-login-form-container">
              <div className="student-login-header">
                <button onClick={handleBack} className="student-back-button">
                  <span className="back-arrow">←</span>
                  Back to Home
                </button>
                <div className="student-login-title">
                  <h1>Student Login</h1>
                  <p>Sign in to your account</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="student-login-form">
                <div className="form-group">
                  <label htmlFor="student-email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input
                      id="student-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@university.edu"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="student-password">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      id="student-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="student-error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                  </div>
                )}

                <button type="submit" className="student-login-btn">
                  Sign In
                </button>

                <div className="student-login-footer">
                  <p>Don't have an account? <a href="/signup" className="signup-link">Create one</a></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userType === 'staff') {
    return (
      <div className="page">
        <div className="login-container">
          <div className="login-header">
            <button onClick={handleBack} className="back-button">← Back</button>
            <h1>Admin/Staff Login</h1>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <label>
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                placeholder="admin@university.edu or staff@university.edu"
              />
            </label>
            <label>
              Password
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                placeholder="Enter your password"
              />
            </label>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="login-submit">Login as Admin/Staff</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page landing-page">
      <div className="landing-container">
        <div className="landing-header">
          <h1 className="landing-title">Welcome to UNIASSIST</h1>
          <p className="landing-subtitle">University Help Desk & Support System</p>
        </div>

        <div className="landing-content">
          <div className="landing-description">
            <h2>Get the help you need</h2>
            <p>Access our comprehensive support system for all your university needs.</p>
          </div>

          <div className="login-options">
            <div className="login-card student-card">
              <div className="card-icon">🎓</div>
              <h3>Student Portal</h3>
              <p>Submit tickets, view announcements, access resources</p>
              <small className="access-note">For enrolled students only</small>
              <button
                onClick={() => setUserType('student')}
                className="login-option-btn student-btn"
              >
                Login as Student
              </button>
            </div>

            <div className="login-card staff-card">
              <div className="card-icon">👨‍💼</div>
              <h3>Admin/Staff Portal</h3>
              <p>Manage tickets, create content, oversee operations</p>
              <small className="access-note">For administrators and staff only</small>
              <button
                onClick={() => setUserType('staff')}
                className="login-option-btn staff-btn"
              >
                Login as Admin/Staff
              </button>
            </div>
          </div>

          <div className="landing-footer">
            <p>New student? <Link to="/signup" className="signup-link">Create an account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [userType, setUserType] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/auth/login', {
        email,
        password
      });

      const user = res.data.user;
      const role = user?.role;

      if (userType === 'staff' && !['admin', 'staff'].includes(role)) {
        setError('Access denied. This login is for administrators and staff only.');
        return;
      }

      if (userType === 'student' && role !== 'student') {
        setError('Access denied. This login is for students only.');
        return;
      }

      login(res.data);

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      setForgotMessage('');

      await API.post('/auth/forgot-password-request', {
        email: forgotEmail
      });

      setForgotMessage(
        'Password reset request sent successfully. Admin has been notified.'
      );

      setForgotEmail('');
    } catch (err) {
      setForgotMessage(
        err.response?.data?.message || 'Failed to send request'
      );
    }
  };

  return (
    <div className="login-landing-page">
      <div className="login-landing-container">
        <div className="login-landing-header">
          <div className="landing-university-header">
            <div className="landing-university-logo">[Y]</div>
            <h2 className="landing-university-name">YUTA UNIVERSITY</h2>
          </div>

          <h1>UNIASSIST</h1>
          <p>University Help Desk & Support System</p>
        </div>

        <div className="login-landing-content">
          {/* Login Toggle Tabs */}
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab ${
                userType === 'student' ? 'active student-active' : ''
              }`}
              onClick={() => {
                setUserType('student');
                setError('');
                setShowForgotPassword(false);
              }}
              style={{
                background:
                  userType === 'student' ? '#00d4ff' : '#2a2a2a',
                color:
                  userType === 'student' ? '#000' : '#e0e0e0',
                border:
                  userType === 'student'
                    ? '2px solid #00d4ff'
                    : '1px solid #444'
              }}
            >
              Student Login
            </button>

            <button
              type="button"
              className={`login-tab ${
                userType === 'staff' ? 'active staff-active' : ''
              }`}
              onClick={() => {
                setUserType('staff');
                setError('');
                setShowForgotPassword(false);
              }}
              style={{
                background:
                  userType === 'staff' ? '#00d4ff' : '#2a2a2a',
                color:
                  userType === 'staff' ? '#000' : '#e0e0e0',
                border:
                  userType === 'staff'
                    ? '2px solid #00d4ff'
                    : '1px solid #444'
              }}
            >
              Admin/Staff Login
            </button>
          </div>

          <div className="login-tabs-content">
            <div className="tab-panel active">
              <div
                className={`login-option-card ${
                  userType === 'student'
                    ? 'student-option'
                    : 'staff-option'
                }`}
              >
                <div className="option-head">
                  <h2>
                    {userType === 'student'
                      ? 'Student Portal'
                      : 'Admin/Staff Portal'}
                  </h2>

                  <p className="option-subtitle">
                    {userType === 'student'
                      ? 'Access your support portal'
                      : 'Access the administration panel'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="quick-form">
                  <div className="form-group">
                    <label>Email Address</label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        userType === 'student'
                          ? 'you@university.edu'
                          : 'staff@university.edu'
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>

                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {error && <div className="auth-error">{error}</div>}

                  <button
                    type="submit"
                    className={`option-btn ${
                      userType === 'student'
                        ? 'student-option-btn'
                        : 'staff-option-btn'
                    }`}
                  >
                    Sign In
                  </button>

                  {userType === 'student' && (
                    <>
                      <div className="forgot-password-link">
                        <button
                          type="button"
                          className="forgot-btn"
                          onClick={() =>
                            setShowForgotPassword(!showForgotPassword)
                          }
                        >
                          {showForgotPassword
                            ? 'Close Forgot Password'
                            : 'Forgot Password?'}
                        </button>
                      </div>

                      {showForgotPassword && (
                        <div className="forgot-password-box">
                          <h4>Forgot Password Request</h4>

                          <form
                            onSubmit={handleForgotPassword}
                            className="forgot-form"
                          >
                            <input
                              type="email"
                              placeholder="Enter your email"
                              value={forgotEmail}
                              onChange={(e) =>
                                setForgotEmail(e.target.value)
                              }
                              required
                            />

                            <button
                              type="submit"
                              className="option-btn student-option-btn"
                              style={{ marginTop: '12px' }}
                            >
                              Send Request
                            </button>
                          </form>

                          {forgotMessage && (
                            <div
                              style={{
                                marginTop: '12px',
                                color: '#00d4ff',
                                fontSize: '14px'
                              }}
                            >
                              {forgotMessage}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="auth-footer">
                        <p>
                          Don't have an account?{' '}
                          <Link to="/signup" className="link">
                            Create one
                          </Link>
                        </p>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    yearOfStudy: '',
    school: '',
    admissionNumber: '',
    dob: '',
    course: '',
    photo: '',
    acknowledgedHandbook: false,
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/register', form);
      login(res.data);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, photo: reader.result }));
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="student-login-page">
      <div className="student-login-container">
        <div className="student-login-left">
          <div className="student-login-illustration">
            <div className="illustration-content">
              <div className="university-icon">🎓</div>
              <h2>Join Our Community!</h2>
              <p>Create your student account and get access to our comprehensive support system</p>
            </div>
          </div>
        </div>

        <div className="student-login-right">
          <div className="student-login-form-container">
            <div className="student-login-header">
              <div className="student-login-title">
                <h1>Create Account</h1>
                <p>Join UNIASSIST today</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="student-login-form">
              <div className="form-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your.email@university.edu"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Academic Information</h3>
                <div className="form-group">
                  <label htmlFor="admissionNumber">Admission Number</label>
                  <input
                    id="admissionNumber"
                    name="admissionNumber"
                    type="text"
                    value={form.admissionNumber}
                    onChange={handleChange}
                    placeholder="Your admission number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="course">Course/Program</label>
                  <input
                    id="course"
                    name="course"
                    type="text"
                    value={form.course}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div className="form-section">
                <div className="acknowledgment-section">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.acknowledgedHandbook}
                      onChange={(e) => setForm({ ...form, acknowledgedHandbook: e.target.checked })}
                      required
                    />
                    <span className="checkbox-text">
                      I have read and understood the university handbook and agree to abide by all university policies.
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="student-error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button type="submit" className="student-login-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="student-login-footer">
                <p>Already have an account? <Link to="/login" className="signup-link">Sign in</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

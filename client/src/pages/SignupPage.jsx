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
    <div className="auth-page">
      <div className="auth-container signup-container">
        <div className="auth-panel">
          <div className="auth-header">
            <Link to="/login" className="back-button">← Back to Login</Link>
            <div>
              <h1>Create Account</h1>
              <p className="auth-subtitle">Join our support system today</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form signup-form">
            <fieldset className="form-section">
              <legend className="section-title">Personal Information</legend>
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
                  placeholder="Create a strong password (min. 8 characters)"
                  required
                />
                <small className="form-hint">Minimum 8 characters with uppercase, lowercase, number, and special character</small>
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend className="section-title">Academic Information</legend>
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
                <label htmlFor="school">School/Faculty</label>
                <input
                  id="school"
                  name="school"
                  type="text"
                  value={form.school}
                  onChange={handleChange}
                  placeholder="e.g., School of Engineering"
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

              <div className="form-group">
                <label htmlFor="yearOfStudy">Year of Study</label>
                <select
                  id="yearOfStudy"
                  name="yearOfStudy"
                  value={form.yearOfStudy}
                  onChange={handleChange}
                >
                  <option value="">Select year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5+</option>
                </select>
              </div>
            </fieldset>

            <fieldset className="form-section">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.acknowledgedHandbook}
                    onChange={(e) => setForm({ ...form, acknowledgedHandbook: e.target.checked })}
                    required
                  />
                  <span>I have read and agree to the university handbook and policies</span>
                </label>
              </div>
            </fieldset>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login" className="link">Sign in</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

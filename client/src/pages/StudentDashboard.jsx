import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import DashboardCards from '../components/DashboardCards';
import AnnouncementsWidget from '../components/AnnouncementsWidget';
import DocumentsWidget from '../components/DocumentsWidget';
import FAQWidget from '../components/FAQWidget';
import HandbookAcknowledgementModal from '../components/HandbookAcknowledgementModal';
import ProfileSettingsModal from '../components/ProfileSettingsModal';
import TopQuestionsWidget from '../components/TopQuestionsWidget';
import Chatbot from '../components/Chatbot';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import '../styles/student-dashboard.css';

export default function StudentDashboard() {
  const {
    user,
    tickets = [],
    loading,
    error,
    fetchTickets,
    createTicket,
    setError
  } = useAuth();

  const location = useLocation();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: ''
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [acknowledgeOpen, setAcknowledgeOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('overview');
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const [passwordMessage, setPasswordMessage] = useState('');
  const [suggestionTimeout, setSuggestionTimeout] = useState(null);

  useEffect(() => {
    if (user) {
      setAcknowledgeOpen(!user.acknowledgedHandbook);
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.prefillTicket) {
      setForm(location.state.prefillTicket);
    }
  }, [location.state]);

  useEffect(() => {
    fetchTickets();

    const interval = setInterval(() => {
      fetchTickets();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchTickets]);

  const fetchSuggestions = async (description) => {
    if (!description || description.length < 10) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch('/api/chatbot/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ description })
      });

      const data = await response.json();

      if (data.suggestions?.length > 0) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('Suggestion fetch error:', err);
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      description: value
    }));

    if (suggestionTimeout) {
      clearTimeout(suggestionTimeout);
    }

    const timeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 1000);

    setSuggestionTimeout(timeout);
  };

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'open').length;
    const progress = tickets.filter((t) => t.status === 'in progress').length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;

    return [
      {
        label: 'Open',
        value: open,
        variant: 'danger',
        description: 'Tickets waiting'
      },
      {
        label: 'In Progress',
        value: progress,
        variant: 'warning',
        description: 'Being worked on'
      },
      {
        label: 'Resolved',
        value: resolved,
        variant: 'success',
        description: 'Completed tickets'
      }
    ];
  }, [tickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');

      await createTicket(form);

      setForm({
        title: '',
        description: '',
        category: ''
      });

      setSuggestions([]);
      setShowSuggestions(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordMessage('Please fill in both password fields.');
      return;
    }

    try {
      setPasswordMessage('');

      await API.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordMessage('Password updated successfully.');

      setPasswordData({
        currentPassword: '',
        newPassword: ''
      });

      setTimeout(() => {
        setPasswordOpen(false);
      }, 1500);
    } catch (err) {
      setPasswordMessage(
        err.response?.data?.message || 'Failed to update password'
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="student-dashboard">
        <div className="student-nav">
          <nav className="nav-menu">
            <button
              className={`nav-item ${activeNav === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveNav('overview')}
            >
              Overview
            </button>

            <button
              className={`nav-item ${activeNav === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveNav('tickets')}
            >
              My Tickets
            </button>

            <button
              className={`nav-item ${activeNav === 'faqs' ? 'active' : ''}`}
              onClick={() => setActiveNav('faqs')}
            >
              Help & FAQs
            </button>

            <button
              className={`nav-item ${activeNav === 'announcements' ? 'active' : ''}`}
              onClick={() => setActiveNav('announcements')}
            >
              Announcements
            </button>

            <button
              className={`nav-item ${activeNav === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveNav('profile')}
            >
              Profile & Settings
            </button>
          </nav>
        </div>

        <div className="student-main">
          <div className="student-content-header">
            <h1>
              {activeNav === 'overview'
                ? 'Dashboard'
                : activeNav === 'tickets'
                ? 'My Support Tickets'
                : activeNav === 'faqs'
                ? 'Help & FAQs'
                : activeNav === 'announcements'
                ? 'Announcements'
                : 'Profile & Settings'}
            </h1>

            <p className="student-breadcrumb">
              Welcome back, {user?.name || 'Student'}
            </p>
          </div>

          {error && <div className="student-alert error">{error}</div>}

          {activeNav === 'overview' && (
            <div className="student-content">
              <DashboardCards stats={stats} />

              <div className="dashboard__grid">
                <div className="dashboard__panel">
                  <section className="dashboard-card">
                    <TopQuestionsWidget tickets={tickets} />
                  </section>
                </div>

                <div className="dashboard__panel">
                  <section className="dashboard-card">
                    <DocumentsWidget />
                  </section>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'tickets' && (
            <div className="student-content">
              <div className="tickets-layout">
                <div className="tickets-form-section">
                  <section className="dashboard-card">
                    <h2 className="card-title">Submit Support Ticket</h2>

                    <form onSubmit={handleSubmit} className="card-form">
                      <input
                        placeholder="Title"
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        required
                      />

                      <input
                        placeholder="Category"
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                        required
                      />

                      <textarea
                        placeholder="Describe your issue"
                        value={form.description}
                        onChange={handleDescriptionChange}
                        required
                      />

                      {showSuggestions && suggestions.length > 0 && (
                        <div className="suggestions-box">
                          <h4>Suggested Solutions</h4>

                          {suggestions.map((suggestion, index) => (
                            <div key={index} className="suggestion-item">
                              <h5>{suggestion.title}</h5>
                              <p>{suggestion.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <button type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Ticket'}
                      </button>
                    </form>
                  </section>
                </div>

                <div className="tickets-list-section">
                  <section className="dashboard-card">
                    <h2 className="card-title">Your Tickets</h2>

                    {loading ? (
                      <p>Loading tickets...</p>
                    ) : tickets.length === 0 ? (
                      <p>No tickets found.</p>
                    ) : (
                      <div className="table-wrapper">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Status</th>
                              <th>Category</th>
                              <th>Assigned</th>
                              <th>Created</th>
                            </tr>
                          </thead>

                          <tbody>
                            {tickets.map((ticket) => (
                              <tr key={ticket._id || ticket.id}>
                                <td>{ticket.title}</td>

                                <td>
                                  <span
                                    className={`status status--${ticket.status.replace(
                                      ' ',
                                      '-'
                                    )}`}
                                  >
                                    {ticket.status}
                                  </span>
                                </td>

                                <td>{ticket.category}</td>

                                <td>
                                  {ticket.assignedTo?.name || 'Unassigned'}
                                </td>

                                <td>
                                  {new Date(ticket.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'faqs' && (
            <div className="student-content">
              <section className="dashboard-card">
                <FAQWidget />
              </section>
            </div>
          )}

          {activeNav === 'announcements' && (
            <div className="student-content">
              <section className="dashboard-card">
                <AnnouncementsWidget />
              </section>
            </div>
          )}

          {activeNav === 'profile' && (
            <div className="student-content">
              <section className="dashboard-card">
                <h2 className="card-title">Profile Information</h2>

                <div className="profile-card">
                  {user?.photo && (
                    <img
                      src={user.photo}
                      alt="Profile"
                      className="profile-photo"
                    />
                  )}

                  <div className="profile-info">
                    <p><strong>Name:</strong> {user?.name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Course:</strong> {user?.course || 'Not specified'}</p>
                    <p><strong>Year:</strong> {user?.yearOfStudy || 'Not specified'}</p>
                    <p><strong>School:</strong> {user?.school || 'Not specified'}</p>
                  </div>

                  <div className="profile-actions">
                    <button
                      className="settings-button"
                      onClick={() => setSettingsOpen(true)}
                    >
                      Edit Profile
                    </button>

                    <button
                      className="settings-button secondary-button"
                      onClick={() => setPasswordOpen(!passwordOpen)}
                    >
                      {passwordOpen
                        ? 'Hide Password Settings'
                        : 'Change Password'}
                    </button>
                  </div>

                  {passwordOpen && (
                    <div className="password-section">
                      <h3>Password Settings</h3>

                      <input
                        type="password"
                        placeholder="Current Password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value
                          })
                        }
                      />

                      <input
                        type="password"
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value
                          })
                        }
                      />

                      <button
                        className="settings-button"
                        onClick={handlePasswordChange}
                      >
                        Save Password
                      </button>

                      {passwordMessage && (
                        <p className="password-message">
                          {passwordMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      <ProfileSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <HandbookAcknowledgementModal
        open={acknowledgeOpen}
        onAcknowledge={() => setAcknowledgeOpen(false)}
      />

      <button
        className="chatbot-float-btn"
        onClick={() => setChatbotOpen(true)}
      >
        🤖
      </button>

      <Chatbot
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
      />
    </DashboardLayout>
  );
}
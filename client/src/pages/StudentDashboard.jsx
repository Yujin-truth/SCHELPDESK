import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import DashboardCards from '../components/DashboardCards';
import AnnouncementsWidget from '../components/AnnouncementsWidget';
import DocumentsWidget from '../components/DocumentsWidget';
import HandbookAcknowledgementModal from '../components/HandbookAcknowledgementModal';
import ProfileSettingsModal from '../components/ProfileSettingsModal';
import TopQuestionsWidget from '../components/TopQuestionsWidget';
import Chatbot from '../components/Chatbot';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, tickets, loading, error, fetchTickets, createTicket, setError } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [acknowledgeOpen, setAcknowledgeOpen] = useState(!user?.acknowledgedHandbook);
  const [activeTab, setActiveTab] = useState('overview');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch smart suggestions when description changes
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ description })
      });

      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Debounced suggestion fetching
  const [suggestionTimeout, setSuggestionTimeout] = useState(null);
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, description: value });

    if (suggestionTimeout) {
      clearTimeout(suggestionTimeout);
    }

    setSuggestionTimeout(setTimeout(() => {
      fetchSuggestions(value);
    }, 1000));
  };


  useEffect(() => {
    // Check for pre-filled ticket from handbook
    if (location.state?.prefillTicket) {
      setForm(location.state.prefillTicket);
    }
  }, [location.state]);

  useEffect(() => {
    setAcknowledgeOpen(!user?.acknowledgedHandbook);
  }, [user]);

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'open').length;
    const inProgress = tickets.filter((t) => t.status === 'in progress').length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;

    return [
      { label: 'Open', value: open, variant: 'danger', description: 'Tickets needing attention' },
      { label: 'In Progress', value: inProgress, variant: 'warning', description: 'Tickets being worked on' },
      { label: 'Resolved', value: resolved, variant: 'success', description: 'Closed tickets' },
    ];
  }, [tickets]);

  useEffect(() => {
    fetchTickets();
    // Polling for real-time updates every 10 seconds
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createTicket(form);
      setForm({ title: '', description: '', category: '' });
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <DashboardLayout>
      <div className="dashboard__header">
        <div>
          <h2>Student Dashboard</h2>
          <p className="dashboard__subheading">Welcome back, {user?.name}!</p>
        </div>
        <button className="settings-button" onClick={() => setSettingsOpen(true)}>
          ⚙️ Settings
        </button>
      </div>

      <nav className="dashboard-nav">
        <button
          className={`dashboard-nav__tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`dashboard-nav__tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`dashboard-nav__tab ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements
        </button>
        <button
          className={`dashboard-nav__tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          Tickets
        </button>
      </nav>

      {activeTab === 'overview' && (
        <>
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
        </>
      )}

      {activeTab === 'profile' && (
        <section className="dashboard-card">
          <h2 className="card-title">Profile</h2>
          <div className="profile-card">
            {user?.photo && (
              <img
                className="profile-photo"
                src={user.photo}
                alt="Profile"
              />
            )}
            <p><strong>Name:</strong> {user?.name || 'Student'}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            {user?.admissionNumber && <p><strong>Admission No:</strong> {user.admissionNumber}</p>}
            {user?.dob && <p><strong>Date of Birth:</strong> {new Date(user.dob).toLocaleDateString()}</p>}
            <p><strong>Course:</strong> {user?.course || 'Not specified'}</p>
            <p><strong>Year of Study:</strong> {user?.yearOfStudy || 'Not specified'}</p>
            <p><strong>School:</strong> {user?.school || 'Not specified'}</p>
          </div>
        </section>
      )}

      {activeTab === 'announcements' && (
        <section className="dashboard-card">
          <AnnouncementsWidget />
        </section>
      )}

      {activeTab === 'tickets' && (
        <div className="dashboard__grid">
          <div className="dashboard__panel">
            <section className="dashboard-card">
              <h2 className="card-title">Submit a Ticket</h2>
              <form onSubmit={handleSubmit} className="card-form">
                <input
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <input
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
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
                    <h4>💡 Suggested Solutions</h4>
                    <p>Before submitting, check if these help:</p>
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="suggestion-item">
                        <div className="suggestion-type">
                          {suggestion.type === 'faq' ? '📖' : '📚'} {suggestion.type.toUpperCase()}
                        </div>
                        <h5>{suggestion.title}</h5>
                        <p>{suggestion.content}</p>
                        {suggestion.category && (
                          <span className="suggestion-category">{suggestion.category}</span>
                        )}
                      </div>
                    ))}
                    <div className="suggestion-actions">
                      <button
                        type="button"
                        className="suggestion-ignore"
                        onClick={() => setShowSuggestions(false)}
                      >
                        Still need help
                      </button>
                    </div>
                  </div>
                )}
                {error && <div className="error">{error}</div>}
                <button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            </section>
          </div>
          <div className="dashboard__panel">
            <section className="dashboard-card">
              <h2 className="card-title">Your Tickets</h2>
              {loading && <p>Loading tickets...</p>}
              {tickets.length === 0 && !loading ? (
                <p>No tickets yet.</p>
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
                        <tr key={ticket._id}>
                          <td>{ticket.title}</td>
                          <td>
                            <span className={`status status--${ticket.status.replace(' ', '-')}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td>{ticket.category}</td>
                          <td>{ticket.assignedTo?.name || 'Unassigned'}</td>
                          <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      <ProfileSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HandbookAcknowledgementModal open={acknowledgeOpen} onAcknowledge={() => setAcknowledgeOpen(false)} />

      {/* Floating Chatbot Button */}
      <button
        className="chatbot-float-btn"
        onClick={() => setChatbotOpen(true)}
        title="Ask UNIASSIST Helper"
      >
        <span>🤖</span>
      </button>

      <Chatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </DashboardLayout>
  );
}

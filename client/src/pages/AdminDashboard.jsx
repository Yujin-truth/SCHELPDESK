import { useEffect, useState } from 'react';
import API from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/admin-dashboard.css';

export default function AdminDashboard() {
  const [staffList, setStaffList] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [handbooks, setHandbooks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General Inquiry', keywords: '' });
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [handbookForm, setHandbookForm] = useState({ title: '', category: '', content: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('overview');

  const fetchData = async () => {
    try {
      const [staffRes, ticketsRes, handbooksRes, announcementsRes, auditRes, faqsRes] = await Promise.all([
        API.get('/admin/staff'),
        API.get('/admin/tickets'),
        API.get('/handbook'),
        API.get('/announcements'),
        API.get('/audit'),
        API.get('/faqs'),
      ]);
      setStaffList(staffRes.data.data || []);
      setTickets(ticketsRes.data.data || []);
      setHandbooks(handbooksRes.data.data || []);
      setAnnouncements(announcementsRes.data.data || []);
      setAuditLogs(auditRes.data.data || []);
      setFaqs(faqsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/admin/staff', form);
      setForm({ name: '', email: '', password: '' });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create staff');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHandbook = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/handbook', handbookForm);
      setHandbookForm({ title: '', category: '', content: '' });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create handbook entry');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/announcements', announcementForm);
      setAnnouncementForm({ title: '', message: '' });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFAQ = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const keywords = faqForm.keywords ? faqForm.keywords.split(',').map(k => k.trim()) : [];
      await API.post('/faqs', { ...faqForm, keywords });
      setFaqForm({ question: '', answer: '', category: 'General Inquiry', keywords: '' });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create FAQ');
    } finally {
      setLoading(false);
    }
  };

  const deleteHandbook = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await API.delete(`/handbook/${id}`);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete');
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await API.delete(`/announcements/${id}`);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete');
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-dashboard">
        {/* Left Navigation */}
        <div className="admin-nav">
          <nav className="nav-menu">
            <button className={`nav-item ${activeNav === 'overview' ? 'active' : ''}`} onClick={() => setActiveNav('overview')}>
              📊 Overview
            </button>
            <button className={`nav-item ${activeNav === 'staff' ? 'active' : ''}`} onClick={() => setActiveNav('staff')}>
              👥 Staff
            </button>
            <button className={`nav-item ${activeNav === 'tickets' ? 'active' : ''}`} onClick={() => setActiveNav('tickets')}>
              Tickets
            </button>
            <button className={`nav-item ${activeNav === 'handbook' ? 'active' : ''}`} onClick={() => setActiveNav('handbook')}>
              📖 Handbook
            </button>
            <button className={`nav-item ${activeNav === 'announcements' ? 'active' : ''}`} onClick={() => setActiveNav('announcements')}>
              📢 Announcements
            </button>
            <button className={`nav-item ${activeNav === 'faq' ? 'active' : ''}`} onClick={() => setActiveNav('faq')}>
              ❓ FAQ
            </button>
            <button className={`nav-item ${activeNav === 'audit' ? 'active' : ''}`} onClick={() => setActiveNav('audit')}>
              🔍 Audit Log
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="admin-main">
          <div className="admin-content-header">
            <h1>{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</h1>
            <p className="admin-breadcrumb">Dashboard / {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</p>
          </div>

          {error && <div className="admin-alert error">{error}</div>}

          {/* Overview */}
          {activeNav === 'overview' && (
            <div className="admin-content">
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <div className="stat-label">Total Staff</div>
                    <div className="stat-value">{staffList.length}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <div className="stat-label">Total Tickets</div>
                    <div className="stat-value">{tickets.length}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📖</div>
                  <div className="stat-info">
                    <div className="stat-label">Handbooks</div>
                    <div className="stat-value">{handbooks.length}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📢</div>
                  <div className="stat-info">
                    <div className="stat-label">Announcements</div>
                    <div className="stat-value">{announcements.length}</div>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>System Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">FAQs Created:</span>
                    <span className="info-value">{faqs.length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Audit Logs:</span>
                    <span className="info-value">{auditLogs.length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Open Tickets:</span>
                    <span className="info-value">{tickets.filter(t => t.status === 'open').length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Resolved Tickets:</span>
                    <span className="info-value">{tickets.filter(t => t.status === 'resolved').length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staff */}
          {activeNav === 'staff' && (
            <div className="admin-content">
              <div className="form-section">
                <h3>Add New Staff Member</h3>
                <form onSubmit={handleCreateStaff}>
                  <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <input placeholder="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Add Staff'}</button>
                </form>
              </div>

              <div className="table-section">
                <h3>Staff Members ({staffList.length})</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map(staff => (
                      <tr key={staff.id}>
                        <td>{staff.name}</td>
                        <td>{staff.email}</td>
                        <td><span className="status-badge active">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tickets */}
          {activeNav === 'tickets' && (
            <div className="admin-content">
              <div className="table-section">
                <h3>All Tickets ({tickets.length})</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Student</th>
                      <th>Status</th>
                      <th>Assigned</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(ticket => (
                      <tr key={ticket.id}>
                        <td>{ticket.title}</td>
                        <td>{ticket.student?.name || '—'}</td>
                        <td><span className={`status-badge ${ticket.status}`}>{ticket.status}</span></td>
                        <td>{ticket.assignedTo?.name || 'Unassigned'}</td>

<td>
  {!ticket.assignedTo && (
    <select
      onChange={async (e) => {
        const staffId = e.target.value;

        if (!staffId) return;

        try {
          await API.put(`/tickets/${ticket.id}/assign`, {
            assignedToId: staffId
          });

          fetchData();
        } catch (err) {
          setError('Failed to assign ticket');
        }
      }}
    >
      <option value="">Assign Staff</option>

      {staffList.map((staff) => (
        <option key={staff.id} value={staff.id}>
          {staff.name}
        </option>
      ))}
    </select>
  )}
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Handbook */}
          {activeNav === 'handbook' && (
            <div className="admin-content">
              <div className="form-section">
                <h3>Add Handbook Entry</h3>
                <form onSubmit={handleCreateHandbook}>
                  <input placeholder="Title" value={handbookForm.title} onChange={(e) => setHandbookForm({ ...handbookForm, title: e.target.value })} required />
                  <input placeholder="Category" value={handbookForm.category} onChange={(e) => setHandbookForm({ ...handbookForm, category: e.target.value })} required />
                  <textarea placeholder="Content" value={handbookForm.content} onChange={(e) => setHandbookForm({ ...handbookForm, content: e.target.value })} required rows="4" />
                  <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Add Entry'}</button>
                </form>
              </div>

              <div className="table-section">
                <h3>Handbook Entries ({handbooks.length})</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {handbooks.map(entry => (
                      <tr key={entry.id}>
                        <td>{entry.title}</td>
                        <td>{entry.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Announcements */}
          {activeNav === 'announcements' && (
            <div className="admin-content">
              <div className="form-section">
                <h3>Create Announcement</h3>
                <form onSubmit={handleCreateAnnouncement}>
                  <input placeholder="Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} required />
                  <textarea placeholder="Message" value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} required rows="4" />
                  <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Post Announcement'}</button>
                </form>
              </div>

              <div className="table-section">
                <h3>Recent Announcements ({announcements.length})</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map(ann => (
                      <tr key={ann.id}>
                        <td>{ann.title}</td>
                        <td>{ann.createdBy?.name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FAQ */}
          {activeNav === 'faq' && (
            <div className="admin-content">
              <div className="form-section">
                <h3>Create FAQ</h3>
                <form onSubmit={handleCreateFAQ}>
                  <input placeholder="Question" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} required />
                  <select value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} required>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="ICT Support">ICT Support</option>
                    <option value="Hostel Maintenance">Hostel Maintenance</option>
                    <option value="Academic Affairs">Academic Affairs</option>
                  </select>
                  <textarea placeholder="Answer" value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} required rows="4" />
                  <input placeholder="Keywords (comma-separated)" value={faqForm.keywords} onChange={(e) => setFaqForm({ ...faqForm, keywords: e.target.value })} />
                  <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create FAQ'}</button>
                </form>
              </div>

              <div className="table-section">
                <h3>FAQ Management ({faqs.length})</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map(faq => (
                      <tr key={faq.id}>
                        <td>{faq.question}</td>
                        <td>{faq.category}</td>
                        <td><span className={`status-badge ${faq.isActive ? 'active' : 'inactive'}`}>{faq.isActive ? 'Active' : 'Inactive'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Audit Log */}
          {activeNav === 'audit' && (
            <div className="admin-content">
              <div className="table-section">
                <h3>Activity Audit Log ({auditLogs.length})</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Action</th>
                      <th>Resource</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id}>
                        <td>{log.user?.name || '—'}</td>
                        <td>{log.action}</td>
                        <td>{log.resource}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

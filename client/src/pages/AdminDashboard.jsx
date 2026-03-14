import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import API from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import DashboardCards from '../components/DashboardCards';

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
  const [activeTab, setActiveTab] = useState('overview');

  const stats = useMemo(() => {
    const total = tickets.length;
    const openCount = tickets.filter((t) => t.status === 'open').length;
    const closedCount = tickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length;

    return [
      { label: 'Total Tickets', value: total, variant: 'primary', description: 'All tickets in the system' },
      { label: 'Open', value: openCount, variant: 'danger', description: 'Tickets needing attention' },
      { label: 'Closed', value: closedCount, variant: 'success', description: 'Resolved or closed tickets' },
    ];
  }, [tickets]);

  const ticketMetrics = useMemo(() => {
    const categoryCounts = tickets.reduce((acc, ticket) => {
      const key = ticket.category || 'Uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topIssues = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const departmentCounts = tickets.reduce((acc, ticket) => {
      const dept = ticket.student?.school || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const ticketsPerDepartment = Object.entries(departmentCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      topIssues,
      ticketsPerDepartment,
    };
  }, [tickets]);

  const fetchStaff = async () => {
    try {
      const res = await API.get('/admin/staff');
      setStaffList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load staff');
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await API.get('/admin/tickets');
      setTickets(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load tickets');
    }
  };

  const fetchHandbooks = async () => {
    try {
      const res = await API.get('/handbook');
      setHandbooks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load handbooks');
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load announcements');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await API.get('/audit');
      setAuditLogs(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load audit logs');
    }
  };

  const fetchFAQs = async () => {
    try {
      const res = await API.get('/faqs');
      setFaqs(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load FAQs');
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchTickets();
    fetchHandbooks();
    fetchAnnouncements();
    fetchAuditLogs();
    fetchFAQs();
    // Polling for real-time updates every 10 seconds
    const interval = setInterval(() => {
      fetchTickets();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/admin/staff', form);
      setForm({ name: '', email: '', password: '' });
      fetchStaff();
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
      fetchHandbooks();
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
      fetchAnnouncements();
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
      fetchFAQs();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFAQ = async (faqId, isActive) => {
    try {
      await API.put(`/faqs/${faqId}`, { isActive: !isActive });
      fetchFAQs();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update FAQ');
    }
  };

  const handleDeleteFAQ = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await API.delete(`/faqs/${faqId}`);
      fetchFAQs();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete FAQ');
    }
  };

  const deleteHandbook = async (id) => {
    if (!confirm('Are you sure you want to delete this handbook entry?')) return;
    setError('');
    setLoading(true);
    try {
      await API.delete(`/handbook/${id}`);
      fetchHandbooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete handbook entry');
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    setError('');
    setLoading(true);
    try {
      await API.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  const assignTicket = async (ticketId, staffId) => {
    setError('');
    setLoading(true);
    try {
      await API.put(`/admin/tickets/${ticketId}/assign`, { staffId });
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to assign ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="dashboard__header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="dashboard__subheading">Manage staff, tickets, and system content</p>
        </div>
      </div>

      <nav className="dashboard-nav">
        <button
          className={`dashboard-nav__tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`dashboard-nav__tab ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          Staff
        </button>
        <button
          className={`dashboard-nav__tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          Tickets
        </button>
        <button
          className={`dashboard-nav__tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button
          className={`dashboard-nav__tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Audit
        </button>
        <button
          className={`dashboard-nav__tab ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          FAQ
        </button>
      </nav>

      {activeTab === 'overview' && (
        <>
          <DashboardCards stats={stats} />

          <section className="dashboard-card">
            <h2 className="card-title">Tickets Summary</h2>
            <div className="chart-grid">
              <div className="chart-card">
                <h3 className="chart-title">Top Issues</h3>
                {ticketMetrics.topIssues.length === 0 ? (
                  <p>No tickets yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={ticketMetrics.topIssues}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        fill="#3b82f6"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {ticketMetrics.topIssues.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"][
                              index % 5
                            ]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="chart-card">
                <h3 className="chart-title">Tickets per Department</h3>
                {ticketMetrics.ticketsPerDepartment.length === 0 ? (
                  <p>No tickets yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={ticketMetrics.ticketsPerDepartment} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="top-issues-list">
              <h3 className="chart-title">Top issues</h3>
              <ol>
                {ticketMetrics.topIssues.length === 0 ? (
                  <li>No tickets yet.</li>
                ) : (
                  ticketMetrics.topIssues.map((issue) => (
                    <li key={issue.name}>
                      {issue.name} ({issue.value})
                    </li>
                  ))
                )}
              </ol>
            </div>
          </section>
        </>
      )}

      {activeTab === 'staff' && (
        <>
          <section className="dashboard-card">
            <h2 className="card-title">Create Staff Account</h2>
            <form onSubmit={handleCreateStaff} className="card-form">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                type="email"
              />
              <input
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                type="password"
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Staff'}
              </button>
              {error && <p className="error">{error}</p>}
            </form>
          </section>

          <section className="dashboard-card">
            <h2 className="card-title">Staff Members</h2>
            {staffList.length === 0 ? (
              <p>No staff accounts yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((member) => (
                      <tr key={member._id}>
                        <td>{member.name}</td>
                        <td>{member.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === 'tickets' && (
        <section className="dashboard-card">
          <h2 className="card-title">Tickets</h2>
          {tickets.length === 0 ? (
            <p>No tickets yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Student</th>
                    <th>Assigned</th>
                    <th>Assign</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td className="mono">{ticket._id}</td>
                      <td>{ticket.title}</td>
                      <td>{ticket.status}</td>
                      <td>{ticket.student?.name || 'Unknown'}</td>
                      <td>{ticket.assignedTo?.name || 'Unassigned'}</td>
                      <td>
                        <select
                          value={ticket.assignedTo?._id || ''}
                          onChange={(e) => assignTicket(ticket._id, e.target.value)}
                          disabled={loading}
                        >
                          <option value="">Unassigned</option>
                          {staffList.map((staff) => (
                            <option key={staff._id} value={staff._id}>
                              {staff.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'content' && (
        <>
          <section className="dashboard-card">
            <h2 className="card-title">Create Handbook Entry</h2>
            <form onSubmit={handleCreateHandbook} className="card-form">
              <input
                placeholder="Title"
                value={handbookForm.title}
                onChange={(e) => setHandbookForm({ ...handbookForm, title: e.target.value })}
                required
              />
              <input
                placeholder="Category"
                value={handbookForm.category}
                onChange={(e) => setHandbookForm({ ...handbookForm, category: e.target.value })}
                required
              />
              <textarea
                placeholder="Content"
                value={handbookForm.content}
                onChange={(e) => setHandbookForm({ ...handbookForm, content: e.target.value })}
                required
                rows="4"
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Entry'}
              </button>
            </form>
          </section>

          <section className="dashboard-card">
            <h2 className="card-title">Handbook Entries</h2>
            {handbooks.length === 0 ? (
              <p>No handbook entries yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {handbooks.map((entry) => (
                      <tr key={entry._id}>
                        <td>{entry.title}</td>
                        <td>{entry.category}</td>
                        <td>
                          <button onClick={() => deleteHandbook(entry._id)} disabled={loading}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="dashboard-card">
            <h2 className="card-title">Create Announcement</h2>
            <form onSubmit={handleCreateAnnouncement} className="card-form">
              <input
                placeholder="Title"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Message"
                value={announcementForm.message}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                required
                rows="3"
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Announcement'}
              </button>
            </form>
          </section>

          <section className="dashboard-card">
            <h2 className="card-title">Announcements</h2>
            {announcements.length === 0 ? (
              <p>No announcements yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Created By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((ann) => (
                      <tr key={ann._id}>
                        <td>{ann.title}</td>
                        <td>{ann.createdBy?.name || 'Unknown'}</td>
                        <td>
                          <button onClick={() => deleteAnnouncement(ann._id)} disabled={loading}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === 'audit' && (
        <section className="dashboard-card">
          <h2 className="card-title">Audit Logs</h2>
          {auditLogs.length === 0 ? (
            <p>No audit logs yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td>{log.user?.name || 'Unknown'}</td>
                      <td>{log.action}</td>
                      <td>{log.resource}</td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'faq' && (
        <>
          <section className="dashboard-card">
            <h2 className="card-title">Create FAQ</h2>
            <form onSubmit={handleCreateFAQ} className="card-form">
              <input
                placeholder="Question"
                value={faqForm.question}
                onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                required
              />
              <select
                value={faqForm.category}
                onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                required
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="ICT Support">ICT Support</option>
                <option value="Hostel Maintenance">Hostel Maintenance</option>
                <option value="Academic Affairs">Academic Affairs</option>
                <option value="Finance Office">Finance Office</option>
                <option value="Examinations">Examinations</option>
                <option value="Registration">Registration</option>
              </select>
              <textarea
                placeholder="Answer"
                value={faqForm.answer}
                onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                required
                rows="4"
              />
              <input
                placeholder="Keywords (comma-separated)"
                value={faqForm.keywords}
                onChange={(e) => setFaqForm({ ...faqForm, keywords: e.target.value })}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create FAQ'}
              </button>
            </form>
          </section>

          <section className="dashboard-card">
            <h2 className="card-title">FAQ Management</h2>
            {faqs.length === 0 ? (
              <p>No FAQs yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Usage</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map((faq) => (
                      <tr key={faq._id}>
                        <td>{faq.question}</td>
                        <td>{faq.category}</td>
                        <td>
                          <span className={`status ${faq.isActive ? 'status--success' : 'status--danger'}`}>
                            {faq.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{faq.usageCount}</td>
                        <td>
                          <button
                            onClick={() => handleToggleFAQ(faq._id, faq.isActive)}
                            disabled={loading}
                            className="btn-small"
                          >
                            {faq.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteFAQ(faq._id)}
                            disabled={loading}
                            className="btn-small btn-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {error && <div className="error">{error}</div>}
    </DashboardLayout>
  );
}

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import '../styles/staff-dashboard.css';

export default function StaffDashboard() {
  const { tickets, loading, error, fetchTickets, assignTicket, updateTicketStatus } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = useMemo(() => {
    const total = tickets.length;
    const myTickets = tickets.filter((t) => t.assignedTo?.id === localStorage.getItem('userId')).length;
    const inProgress = tickets.filter((t) => t.status === 'in progress').length;

    return [
      { label: 'Total Tickets', value: total },
      { label: 'My Tickets', value: myTickets },
      { label: 'In Progress', value: inProgress },
    ];
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    if (filterStatus === 'all') return tickets;
    return tickets.filter((t) => t.status === filterStatus);
  }, [tickets, filterStatus]);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  return (
    <DashboardLayout>
      <div className="staff-dashboard">
        {/* Left Navigation */}
        <div className="staff-nav">
          <nav className="nav-menu">
            <button className="nav-item active">
              Support Queue
            </button>
            <button className="nav-item">
              Resolved
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="staff-main">
          <div className="staff-content-header">
            <h1>Support Queue</h1>
            <p className="staff-breadcrumb">Dashboard / Tickets</p>
          </div>

          {error && <div className="staff-alert error">{error}</div>}

          {/* Stats */}
          <div className="stats-row">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="stat-info">
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="filter-section">
            <h3>Filter by Status</h3>
            <div className="filter-buttons">
              <button className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
                All ({tickets.length})
              </button>
              <button className={`filter-btn ${filterStatus === 'open' ? 'active' : ''}`} onClick={() => setFilterStatus('open')}>
                Open ({tickets.filter((t) => t.status === 'open').length})
              </button>
              <button className={`filter-btn ${filterStatus === 'in progress' ? 'active' : ''}`} onClick={() => setFilterStatus('in progress')}>
                In Progress ({tickets.filter((t) => t.status === 'in progress').length})
              </button>
              <button className={`filter-btn ${filterStatus === 'resolved' ? 'active' : ''}`} onClick={() => setFilterStatus('resolved')}>
                Resolved ({tickets.filter((t) => t.status === 'resolved').length})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-section">
            <h3>Tickets</h3>
            {loading ? (
              <p className="loading">Loading tickets...</p>
            ) : filteredTickets.length === 0 ? (
              <p className="empty">No {filterStatus !== 'all' ? filterStatus : ''} tickets available</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="student-col">{ticket.student?.name || '—'}</td>
                      <td className="title-col">{ticket.title}</td>
                      <td>{ticket.category}</td>
                      <td><span className={`status-badge ${ticket.status.replace(' ', '-')}`}>{ticket.status}</span></td>
                      <td>{ticket.assignedTo?.name || 'Unassigned'}</td>
                     <td>
  {!ticket.assignedTo ? (
    <button
      onClick={() => assignTicket(ticket.id)}
      disabled={loading}
      className="btn-action"
    >
      Assign To Me
    </button>
  ) : ticket.assignedTo?.id === localStorage.getItem('userId') ? (
    <div className="action-group">
      <button
        onClick={() => updateTicketStatus(ticket.id, 'in progress')}
        disabled={loading}
        className="btn-action"
      >
        In Progress
      </button>

      <button
        onClick={() => updateTicketStatus(ticket.id, 'resolved')}
        disabled={loading}
        className="btn-action btn-success"
      >
        Resolve
      </button>

      <button
        onClick={() => updateTicketStatus(ticket.id, 'visit office')}
        disabled={loading}
        className="btn-action btn-warning"
      >
        Visit Office
      </button>

      <button
        onClick={() => updateTicketStatus(ticket.id, 'closed')}
        disabled={loading}
        className="btn-action btn-danger"
      >
        Close
      </button>
    </div>
  ) : (
    <span className="assigned-label">
      Assigned to {ticket.assignedTo?.name}
    </span>
  )}
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

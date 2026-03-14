import { useEffect, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardCards from '../components/DashboardCards';
import { useAuth } from '../context/AuthContext';

export default function StaffDashboard() {
  const { tickets, loading, error, fetchTickets, assignTicket, updateTicketStatus } = useAuth();

  const stats = useMemo(() => {
    const total = tickets.length;
    const assigned = tickets.filter((t) => t.assignedTo).length;
    const open = tickets.filter((t) => t.status === 'open').length;

    return [
      { label: 'Total Tickets', value: total, variant: 'primary', description: 'All tickets visible to you' },
      { label: 'Assigned', value: assigned, variant: 'warning', description: 'Tickets already claimed' },
      { label: 'Open', value: open, variant: 'danger', description: 'Tickets needing assignment' },
    ];
  }, [tickets]);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  return (
    <DashboardLayout>
      <div className="dashboard__header">
        <h2>Staff Dashboard</h2>
        <p className="dashboard__subheading">Manage tickets and keep the queue moving.</p>
      </div>

      <DashboardCards stats={stats} />

      <section className="dashboard-card">
        <h2 className="card-title">Tickets</h2>
        {error && <div className="error">{error}</div>}
        {loading && <p>Loading tickets...</p>}
        {tickets.length === 0 && !loading ? (
          <p>No tickets available.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Student</th>
                  <th>Assigned</th>
                  <th>Actions</th>
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
                    <td>{ticket.student?.name || 'Unknown'}</td>
                    <td>{ticket.assignedTo?.name || 'Unassigned'}</td>
                    <td>
                      {!ticket.assignedTo && (
                        <button onClick={() => assignTicket(ticket._id)} disabled={loading}>
                          Assign to me
                        </button>
                      )}
                      {ticket.assignedTo && (
                        <div className="status-actions">
                          <button onClick={() => updateTicketStatus(ticket._id, 'in progress')} disabled={loading}>
                            In Progress
                          </button>
                          <button onClick={() => updateTicketStatus(ticket._id, 'resolved')} disabled={loading}>
                            Resolved
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

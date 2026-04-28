import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StaffTicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unassigned');
  const [error, setError] = useState('');
  const [resolution, setResolution] = useState('');

  const statusColors = {
    open: '#ff9800',
    'in progress': '#2196F3',
    resolved: '#4CAF50',
    closed: '#999',
    escalated: '#f44336',
    'visit office': '#9C27B0'
  };

  const priorityColors = {
    low: '#4CAF50',
    medium: '#FFC107',
    high: '#FF9800',
    critical: '#f44336'
  };

  useEffect(() => {
    fetchTickets();
  }, [activeTab]);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const response = await axios.get('/api/tickets?limit=100');
      let allTickets = response.data.data || [];

      if (activeTab === 'unassigned') {
        allTickets = allTickets.filter(ticket => !ticket.assignedToId);
      }

      if (activeTab === 'assigned') {
        allTickets = allTickets.filter(ticket => ticket.assignedToId);
      }

      setTickets(allTickets);
    } catch (err) {
      console.error(err);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const assignToMe = async (ticketId) => {
    try {
      await axios.put(`/api/tickets/${ticketId}/claim`);

      await fetchTickets();

      const updated = tickets.find(t => t.id === ticketId);
      setSelectedTicket(updated || null);

      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const quickStatusUpdate = async (ticketId, status) => {
    try {
      await axios.put(`/api/tickets/${ticketId}/status`, {
        status,
        resolution
      });

      await fetchTickets();

      setResolution('');
      setError('');

      const updatedResponse = await axios.get(`/api/tickets/${ticketId}`);
      setSelectedTicket(updatedResponse.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const updatePriority = async (ticketId, priority) => {
    try {
      await axios.put(`/api/tickets/${ticketId}/priority`, {
        priority
      });

      await fetchTickets();

      const updatedResponse = await axios.get(`/api/tickets/${ticketId}`);
      setSelectedTicket(updatedResponse.data.data);

      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update priority');
    }
  };

  if (loading) {
    return <div className="loading">Loading tickets...</div>;
  }

  return (
    <div className="staff-ticket-management">
      <h2>Ticket Management Dashboard</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={activeTab === 'unassigned' ? 'active' : ''}
          onClick={() => setActiveTab('unassigned')}
        >
          Unassigned
        </button>

        <button
          className={activeTab === 'assigned' ? 'active' : ''}
          onClick={() => setActiveTab('assigned')}
        >
          Assigned
        </button>

        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
      </div>

      <div className="layout">
        <div className="ticket-list">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className={`ticket-card ${
                selectedTicket?.id === ticket.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="ticket-header">
                <h4>{ticket.title}</h4>

                <span
                  className="status-badge"
                  style={{
                    backgroundColor: statusColors[ticket.status]
                  }}
                >
                  {ticket.status}
                </span>
              </div>

              <small>{ticket.category}</small>

              <div className="ticket-footer">
                {ticket.priority && (
                  <span
                    className="priority-badge"
                    style={{
                      backgroundColor: priorityColors[ticket.priority]
                    }}
                  >
                    {ticket.priority}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedTicket && (
          <div className="details-panel">
            <h3>{selectedTicket.title}</h3>

            <p>
              <strong>Status:</strong>{' '}
              <span
                style={{
                  color: statusColors[selectedTicket.status]
                }}
              >
                {selectedTicket.status}
              </span>
            </p>

            <p>
              <strong>Category:</strong> {selectedTicket.category}
            </p>

            <p>
              <strong>Department:</strong> {selectedTicket.department}
            </p>

            <p>
              <strong>Description:</strong>
            </p>

            <div className="description-box">
              {selectedTicket.description}
            </div>

            {!selectedTicket.assignedToId && (
              <button
                className="assign-btn"
                onClick={() => assignToMe(selectedTicket.id)}
              >
                Assign To Me
              </button>
            )}

            {selectedTicket.assignedToId && (
              <>
                <div className="resolution-box">
                  <label>Resolution / Notes</label>

                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Write notes before updating..."
                  />
                </div>

                <div className="action-buttons">
                  <button
                    className="progress-btn"
                    onClick={() =>
                      quickStatusUpdate(
                        selectedTicket.id,
                        'in progress'
                      )
                    }
                  >
                    In Progress
                  </button>

                  <button
                    className="resolved-btn"
                    onClick={() =>
                      quickStatusUpdate(
                        selectedTicket.id,
                        'resolved'
                      )
                    }
                  >
                    Resolve
                  </button>

                  <button
                    className="visit-btn"
                    onClick={() =>
                      quickStatusUpdate(
                        selectedTicket.id,
                        'visit office'
                      )
                    }
                  >
                    Visit Office
                  </button>

                  <button
                    className="close-btn"
                    onClick={() =>
                      quickStatusUpdate(
                        selectedTicket.id,
                        'closed'
                      )
                    }
                  >
                    Close
                  </button>
                </div>

                <div className="priority-buttons">
                  <button onClick={() => updatePriority(selectedTicket.id, 'low')}>
                    Low
                  </button>

                  <button onClick={() => updatePriority(selectedTicket.id, 'medium')}>
                    Medium
                  </button>

                  <button onClick={() => updatePriority(selectedTicket.id, 'high')}>
                    High
                  </button>

                  <button onClick={() => updatePriority(selectedTicket.id, 'critical')}>
                    Critical
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .staff-ticket-management {
          padding: 20px;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .tabs button {
          padding: 10px 18px;
          border: none;
          cursor: pointer;
          background: #eee;
          border-radius: 6px;
        }

        .tabs button.active {
          background: #2196F3;
          color: white;
        }

        .layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .ticket-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ticket-card {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 8px;
          cursor: pointer;
          background: white;
        }

        .ticket-card.selected {
          border: 2px solid #2196F3;
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-badge,
        .priority-badge {
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
        }

        .details-panel {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background: white;
        }

        .description-box {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
        }

        .assign-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 16px;
          cursor: pointer;
          border-radius: 6px;
          margin-bottom: 15px;
        }

        .resolution-box {
          margin-top: 20px;
        }

        .resolution-box textarea {
          width: 100%;
          min-height: 80px;
          margin-top: 8px;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }

        .action-buttons button {
          border: none;
          padding: 10px 14px;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .progress-btn {
          background: #2196F3;
        }

        .resolved-btn {
          background: #4CAF50;
        }

        .visit-btn {
          background: #9C27B0;
        }

        .close-btn {
          background: #777;
        }

        .priority-buttons {
          display: flex;
          gap: 8px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .priority-buttons button {
          border: none;
          padding: 8px 12px;
          background: #eee;
          cursor: pointer;
          border-radius: 6px;
        }

        .loading {
          padding: 40px;
          text-align: center;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          margin-bottom: 20px;
          border-radius: 6px;
        }

        @media (max-width: 900px) {
          .layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffTicketManagement;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TicketTracker = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const statusColors = {
    'open': '#ff9800',
    'in progress': '#2196F3',
    'resolved': '#4CAF50',
    'closed': '#999',
    'escalated': '#f44336'
  };

  const priorityColors = {
    'low': '#4CAF50',
    'medium': '#FFC107',
    'high': '#FF9800',
    'critical': '#f44336'
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/tickets' 
        : `/api/tickets?status=${filter}`;
      
      const response = await axios.get(url);
      setTickets(response.data.data || []);
    } catch (err) {
      setError('Failed to load tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'open': '○',
      'in progress': '◐',
      'resolved': '✓',
      'closed': '✕',
      'escalated': '⚠'
    };
    return icons[status] || '•';
  };

  if (loading) {
    return <div className="loading">Loading tickets...</div>;
  }

  return (
    <div className="ticket-tracker">
      <h2>My Support Tickets</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-tabs">
        {['all', 'open', 'in progress', 'resolved', 'closed'].map(status => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="tickets-list">
        {tickets.length === 0 ? (
          <div className="no-tickets">
            <p>No tickets found</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <div
              key={ticket.id}
              className="ticket-card"
              onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
            >
              <div className="ticket-header">
                <div className="ticket-title">
                  <span className="status-icon" style={{ color: statusColors[ticket.status] }}>
                    {getStatusIcon(ticket.status)}
                  </span>
                  <div>
                    <h3>{ticket.title}</h3>
                    <small>#{ticket.id.substring(0, 8)}</small>
                  </div>
                </div>
                <div className="ticket-badges">
                  <span
                    className="badge status-badge"
                    style={{ backgroundColor: statusColors[ticket.status] }}
                  >
                    {ticket.status}
                  </span>
                  {ticket.priority && (
                    <span
                      className="badge priority-badge"
                      style={{ backgroundColor: priorityColors[ticket.priority] }}
                    >
                      {ticket.priority}
                    </span>
                  )}
                </div>
              </div>

              {selectedTicket?.id === ticket.id && (
                <div className="ticket-details">
                  <div className="detail-row">
                    <strong>Category:</strong>
                    <span>{ticket.category}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Department:</strong>
                    <span>{ticket.department}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Urgency:</strong>
                    <span>{ticket.urgency}/10</span>
                  </div>
                  {ticket.assignedTo && (
                    <div className="detail-row">
                      <strong>Assigned to:</strong>
                      <span>{ticket.assignedTo.name}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <strong>Created:</strong>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  {ticket.resolvedAt && (
                    <div className="detail-row">
                      <strong>Resolved:</strong>
                      <span>{new Date(ticket.resolvedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="description-section">
                    <strong>Description:</strong>
                    <p>{ticket.description}</p>
                  </div>

                  {ticket.comments && ticket.comments.length > 0 && (
                    <div className="comments-section">
                      <strong>Latest Comments:</strong>
                      <div className="comments-list">
                        {ticket.comments.slice(0, 3).map(comment => (
                          <div key={comment.id} className="comment">
                            <div className="comment-header">
                              <strong>{comment.author?.name || 'Unknown'}</strong>
                              <small>{new Date(comment.createdAt).toLocaleString()}</small>
                            </div>
                            <p>{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .ticket-tracker {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }

        .ticket-tracker h2 {
          margin-top: 0;
          color: #333;
          margin-bottom: 20px;
        }

        .filter-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
          font-weight: 600;
        }

        .filter-btn:hover {
          border-color: #2196F3;
        }

        .filter-btn.active {
          background: #2196F3;
          color: white;
          border-color: #2196F3;
        }

        .tickets-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .no-tickets {
          text-align: center;
          padding: 40px;
          color: #999;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .ticket-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ticket-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: #2196F3;
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .ticket-title {
          display: flex;
          gap: 12px;
          flex: 1;
        }

        .status-icon {
          font-size: 20px;
          margin-top: 2px;
        }

        .ticket-title h3 {
          margin: 0;
          color: #333;
          font-size: 16px;
        }

        .ticket-title small {
          display: block;
          color: #999;
          font-size: 12px;
        }

        .ticket-badges {
          display: flex;
          gap: 8px;
        }

        .badge {
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .ticket-details {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #eee;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }

        .detail-row strong {
          color: #666;
        }

        .detail-row span {
          color: #333;
        }

        .description-section {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }

        .description-section p {
          margin: 8px 0;
          color: #555;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .comments-section {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .comment {
          background: #f9f9f9;
          padding: 12px;
          border-radius: 4px;
          font-size: 13px;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .comment-header strong {
          color: #333;
        }

        .comment-header small {
          color: #999;
        }

        .comment p {
          margin: 0;
          color: #555;
          line-height: 1.4;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          border-left: 4px solid #c62828;
        }

        @media (max-width: 600px) {
          .ticket-tracker {
            padding: 12px;
          }

          .ticket-header {
            flex-direction: column;
          }

          .ticket-badges {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketTracker;

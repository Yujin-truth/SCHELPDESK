import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalyticalsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [staffWorkload, setStaffWorkload] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, workloadRes, trendsRes] = await Promise.all([
        axios.get('/api/reporting/stats/overview'),
        axios.get('/api/reporting/stats/staff-workload'),
        axios.get('/api/reporting/stats/trends')
      ]);

      setStats(statsRes.data.data);
      setStaffWorkload(workloadRes.data.data);
      setTrends(trendsRes.data.data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="analytics-dashboard">
      <h2>Analytics & Reporting Dashboard</h2>

      {/* Overview Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalTickets}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.resolvedTickets}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.resolutionRate}</div>
            <div className="stat-label">Resolution Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.averageUrgency}</div>
            <div className="stat-label">Avg Urgency</div>
          </div>
        </div>
      )}

      {/* Status Distribution */}
      {stats?.byStatus && (
        <div className="section">
          <h3>Tickets by Status</h3>
          <div className="status-breakdown">
            {stats.byStatus.map(item => (
              <div key={item.status} className="breakdown-item">
                <div className="breakdown-label">{item.status}</div>
                <div className="breakdown-bar">
                  <div
                    className="breakdown-fill"
                    style={{
                      width: `${(item.count / stats.totalTickets) * 100}%`,
                      backgroundColor: getStatusColor(item.status)
                    }}
                  />
                </div>
                <div className="breakdown-count">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Distribution */}
      {stats?.byPriority && (
        <div className="section">
          <h3>Tickets by Priority</h3>
          <div className="priority-breakdown">
            {stats.byPriority.map(item => (
              <div key={item.priority} className="priority-item">
                <span className="priority-label">{item.priority}</span>
                <span className="priority-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Distribution */}
      {stats?.byCategory && (
        <div className="section">
          <h3>Tickets by Category</h3>
          <div className="category-list">
            {stats.byCategory.map(item => (
              <div key={item.category} className="category-item">
                <span>{item.category}</span>
                <span className="badge">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Workload */}
      {staffWorkload.length > 0 && (
        <div className="section">
          <h3>Staff Workload</h3>
          <div className="workload-table">
            <div className="table-header">
              <div>Staff Member</div>
              <div>Status</div>
              <div>Count</div>
            </div>
            {staffWorkload.map(item => (
              <div key={`${item.staffId}-${item.status}`} className="table-row">
                <div>{item.staffName}</div>
                <div>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="count">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      {trends.length > 0 && (
        <div className="section">
          <h3>Monthly Trends</h3>
          <div className="trends-table">
            <div className="table-header">
              <div>Month</div>
              <div>Total Tickets</div>
              <div>Resolved</div>
              <div>Resolution %</div>
            </div>
            {trends.map((item, idx) => {
              const month = new Date(item.month).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short'
              });
              const resolutionPct = item.totalTickets > 0 
                ? ((item.resolvedTickets / item.totalTickets) * 100).toFixed(1)
                : 0;
              
              return (
                <div key={idx} className="table-row">
                  <div>{month}</div>
                  <div>{item.totalTickets}</div>
                  <div>{item.resolvedTickets}</div>
                  <div>{resolutionPct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .analytics-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .analytics-dashboard h2 {
          margin-top: 0;
          color: #333;
          margin-bottom: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .stat-card:nth-child(2) {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        }

        .stat-card:nth-child(3) {
          background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
        }

        .stat-card:nth-child(4) {
          background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          opacity: 0.9;
        }

        .section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .section h3 {
          margin-top: 0;
          color: #333;
          margin-bottom: 16px;
        }

        .status-breakdown {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .breakdown-item {
          display: grid;
          grid-template-columns: 100px 1fr 50px;
          gap: 12px;
          align-items: center;
        }

        .breakdown-label {
          font-weight: 600;
          color: #666;
          text-transform: capitalize;
        }

        .breakdown-bar {
          background: #f0f0f0;
          border-radius: 4px;
          height: 24px;
          overflow: hidden;
        }

        .breakdown-fill {
          height: 100%;
          transition: width 0.3s;
        }

        .breakdown-count {
          text-align: right;
          color: #333;
          font-weight: 600;
        }

        .priority-breakdown {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .priority-item {
          background: #f9f9f9;
          padding: 12px;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-transform: capitalize;
        }

        .priority-label {
          font-weight: 600;
          color: #333;
        }

        .priority-count {
          background: #2196F3;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .badge {
          background: #FF9800;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .workload-table,
        .trends-table {
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: #f5f5f5;
          padding: 12px 16px;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #ddd;
        }

        .trends-table .table-header {
          grid-template-columns: repeat(4, 1fr);
        }

        .table-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
          align-items: center;
        }

        .trends-table .table-row {
          grid-template-columns: repeat(4, 1fr);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 4px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .count {
          text-align: right;
        }

        .loading,
        .error-message {
          text-align: center;
          padding: 40px;
          font-size: 16px;
        }

        .error-message {
          color: #c62828;
          background: #ffebee;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .analytics-dashboard {
            padding: 12px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .breakdown-item {
            grid-template-columns: 80px 1fr 40px;
          }

          .table-header,
          .table-row {
            grid-template-columns: repeat(2, 1fr);
            font-size: 13px;
          }

          .trends-table .table-header,
          .trends-table .table-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

function getStatusColor(status) {
  const colors = {
    'open': '#ff9800',
    'in progress': '#2196F3',
    'resolved': '#4CAF50',
    'closed': '#999',
    'escalated': '#f44336'
  };
  return colors[status] || '#999';
}

export default AnalyticalsDashboard;

import React, { useState } from 'react';
import axios from 'axios';

const TicketSubmissionForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'ICT Support',
    'Maintenance',
    'Academic',
    'Administrative',
    'Library',
    'Student Services'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/tickets', formData);
      
      setSuccess(`Ticket created successfully! #${response.data.data.id.substring(0, 8)}`);
      setFormData({ title: '', description: '', category: '' });
      
      if (onSuccess) {
        onSuccess(response.data.data);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ticket-submission-form">
      <h2>Create a Support Ticket</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief description of your issue"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide detailed information about your issue"
            rows={6}
            maxLength={2000}
          />
          <small>{formData.description.length}/2000</small>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category (optional)</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Let system auto-detect</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <small>Leave empty for AI-powered categorization</small>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="submit-btn"
        >
          {loading ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>

      <style jsx>{`
        .ticket-submission-form {
          background: white;
          border-radius: 8px;
          padding: 24px;
          max-width: 600px;
          margin: 20px auto;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .ticket-submission-form h2 {
          margin-top: 0;
          color: #333;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #333;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #b3a7a7;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .form-group small {
          display: block;
          margin-top: 4px;
          color: #666;
          font-size: 12px;
        }

        .submit-btn {
          background: #4CAF50;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #45a049;
        }

        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          border-left: 4px solid #c62828;
        }

        .success-message {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          border-left: 4px solid #2e7d32;
        }

        @media (max-width: 600px) {
          .ticket-submission-form {
            padding: 16px;
            margin: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketSubmissionForm;

import API from '../services/api';
import { useState } from 'react';

export default function HandbookAcknowledgementModal({ open, onAcknowledge }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleAcknowledge = async () => {
    setLoading(true);
    setError('');
    try {
      await API.put('/auth/me', { acknowledgedHandbook: true });
      onAcknowledge();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to acknowledge handbook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <header className="modal__header">
          <h3>Read & Acknowledge Handbook</h3>
        </header>

        <p>
          Before using the help desk, please review the university handbook. By clicking
          "I Agree" you confirm that you have read and understood the policies.
        </p>
        <p>
          <a href="/handbook" target="_blank" rel="noreferrer">
            View the handbook
          </a>
        </p>

        {error && <div className="error">{error}</div>}

        <button onClick={handleAcknowledge} disabled={loading}>
          {loading ? 'Saving...' : 'I Agree'}
        </button>
      </div>
    </div>
  );
}

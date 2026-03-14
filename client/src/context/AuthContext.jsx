import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = ({ token: jwt, user: u }) => {
    setToken(jwt);
    setUser(u);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTickets([]);
  };

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createTicket = useCallback(async (ticketData) => {
    setLoading(true);
    setError('');
    try {
      await API.post('/tickets', ticketData);
      fetchTickets(); // Refresh tickets
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
      throw err; // Re-throw for component handling
    } finally {
      setLoading(false);
    }
  }, [fetchTickets]);

  const assignTicket = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      await API.put(`/tickets/${id}/assign`);
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setLoading(false);
    }
  }, [fetchTickets]);

  const updateTicketStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError('');
    try {
      await API.put(`/tickets/${id}/status`, { status });
      fetchTickets();
      // Simulate email notification
      alert(`Email notification sent to student: Ticket status updated to ${status}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  }, [fetchTickets]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      tickets,
      loading,
      error,
      login,
      logout,
      fetchTickets,
      createTicket,
      assignTicket,
      updateTicketStatus,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react';
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

  // Save auth to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.name);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = ({ token: jwt, user: loggedUser }) => {
    setToken(jwt);
    setUser(loggedUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTickets([]);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  };

  const fetchTickets = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const res = await API.get('/tickets');

      setTickets(res.data.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || 'Failed to load tickets'
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createTicket = useCallback(
    async (ticketData) => {
      setLoading(true);
      setError('');

      try {
        await API.post('/tickets', ticketData);

        await fetchTickets();
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message || 'Failed to create ticket'
        );

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTickets]
  );

  // FIXED CLAIM ROUTE
  const assignTicket = useCallback(
    async (id) => {
      setLoading(true);
      setError('');

      try {
        await API.put(`/tickets/${id}/claim`);

        await fetchTickets();
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message || 'Failed to assign ticket'
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchTickets]
  );

  const updateTicketStatus = useCallback(
    async (id, status) => {
      setLoading(true);
      setError('');

      try {
        await API.put(`/tickets/${id}/status`, {
          status
        });

        await fetchTickets();
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message || 'Failed to update ticket status'
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchTickets]
  );

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
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
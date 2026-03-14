import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const role = user.role;
      if (role === 'staff') {
        navigate('/staff');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  return <div>Redirecting...</div>;
}

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="brand">UNIASSIST</div>

      {user && (
        <div className="user-actions">
          <span className="user-role">{user.role}</span>
          <span className="user-name">{user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </header>
  );
}

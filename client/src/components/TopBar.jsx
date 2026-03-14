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
      <div className="topbar__left">
        <div className="topbar__logo">UNIASSIST</div>
        <div className="topbar__title">Campus Help Desk</div>
      </div>

      {user && (
        <div className="topbar__actions">
          <div className="topbar__user">
            <span className="topbar__user-name">{user.name}</span>
            <span className="topbar__user-role">{user.role}</span>
          </div>
          <button className="topbar__logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

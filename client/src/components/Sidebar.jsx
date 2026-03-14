import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <h2>UNIASSIST</h2>
        <span className="sidebar__subtitle">Help Desk</span>
      </div>

      <nav className="sidebar__nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'sidebar__link active' : 'sidebar__link')}>
          Dashboard
        </NavLink>
        {user?.role === 'student' && (
          <>
            <NavLink
              to="/student"
              className={({ isActive }) => (isActive ? 'sidebar__link active' : 'sidebar__link')}
            >
              My Tickets
            </NavLink>
            <NavLink
              to="/handbook"
              className={({ isActive }) => (isActive ? 'sidebar__link active' : 'sidebar__link')}
            >
              Handbook
            </NavLink>
          </>
        )}
        {user?.role === 'staff' && (
          <>
            <NavLink
              to="/staff"
              className={({ isActive }) => (isActive ? 'sidebar__link active' : 'sidebar__link')}
            >
              Tickets
            </NavLink>
            <NavLink
              to="/handbook"
              className={({ isActive }) => (isActive ? 'sidebar__link active' : 'sidebar__link')}
            >
              Handbook
            </NavLink>
          </>
        )}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? 'sidebar__link active' : 'sidebar__link')}
          >
            Tickets & Staff
          </NavLink>
        )}
      </nav>

      <div className="sidebar__user">
        <div className="sidebar__user-info">
          <span className="sidebar__user-name">{user?.name}</span>
          <span className="sidebar__user-role">{user?.role?.toUpperCase()}</span>
        </div>
        <div className="sidebar__meta">
          <span>{user?.yearOfStudy || ''}</span>
          <span>{user?.school || ''}</span>
        </div>
      </div>
    </aside>
  );
}

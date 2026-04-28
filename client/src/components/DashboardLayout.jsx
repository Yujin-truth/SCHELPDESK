import TopBar from './TopBar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

import TopBar from './TopBar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard__content">
        <TopBar />
        <main className="dashboard__main">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardCards({ stats }) {
  return (
    <div className="dashboard-cards">
      {stats.map((stat) => (
        <div key={stat.label} className="card">
          <div className="card-title">{stat.label}</div>
          <div className="card-value">{stat.value}</div>
          <p className="card-description">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}

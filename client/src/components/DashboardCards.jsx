export default function DashboardCards({ stats }) {
  return (
    <div className="cards">
      {stats.map((stat) => (
        <div key={stat.label} className="card card--stat">
          <div className="card__header">
            <h4>{stat.label}</h4>
            <span className={`badge badge--${stat.variant}`}>{stat.value}</span>
          </div>
          <p className="card__desc">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}

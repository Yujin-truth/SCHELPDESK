import { useMemo } from 'react';

export default function TopQuestionsWidget({ tickets }) {
  const topQuestions = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const counts = tickets.reduce((acc, ticket) => {
      const key = ticket.title?.trim() || 'Untitled';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));
  }, [tickets]);

  if (topQuestions.length === 0) {
    return (
      <div className="top-questions">
        <h4>Most Asked Questions</h4>
        <p>No questions yet. Submit a ticket to get started.</p>
      </div>
    );
  }

  return (
    <div className="top-questions">
      <h4>Most Asked Questions</h4>
      <ul>
        {topQuestions.map((q) => (
          <li key={q.title}>
            <span>{q.title}</span>
            <span className="count">{q.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

export default function HandbookPage() {
  const [handbooks, setHandbooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHandbooks();
  }, [selectedCategory, search]);

  const fetchHandbooks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (search) params.append('search', search);
      const res = await API.get(`/handbook?${params}`);
      setHandbooks(res.data);

      // Extract unique categories
      const uniqueCategories = [...new Set(res.data.map(h => h.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load handbook');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = (handbook) => {
    // Navigate to student dashboard with pre-filled ticket
    navigate('/student', {
      state: {
        prefillTicket: {
          title: `Question about ${handbook.title}`,
          description: `I have a question regarding: ${handbook.title}\n\nPlease provide clarification.`,
          category: 'General Inquiry',
        },
      },
    });
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <DashboardLayout>
      <div className="handbook">
        <div className="handbook__header">
          <h2>Digital Handbook</h2>
          <p>University rules, policies, and procedures</p>
        </div>

        <div className="handbook__filters">
          <input
            type="text"
            placeholder="Search handbook..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <p>Loading handbook...</p>
        ) : (
          <div className="handbook__list">
            {handbooks.length === 0 ? (
              <p>No handbook entries found.</p>
            ) : (
              handbooks.map((handbook) => {
                const expanded = expandedId === handbook.id;

                return (
                  <div
                    key={handbook.id}
                    className={`handbook__item ${expanded ? 'expanded' : ''}`}
                  >
                    <button
                      type="button"
                      className="handbook__item-header"
                      onClick={() => toggleExpand(handbook.id)}
                    >
                      <div>
                        <h3>{handbook.title}</h3>
                        <span className="category-badge">{handbook.category}</span>
                      </div>
                      <span className="chevron">{expanded ? '−' : '+'}</span>
                    </button>

                    {expanded && (
                      <div className="handbook__content">
                        <p>{handbook.content}</p>
                        <button
                          className="ask-button"
                          onClick={() => handleAskQuestion(handbook)}
                        >
                          Ask About This Rule
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
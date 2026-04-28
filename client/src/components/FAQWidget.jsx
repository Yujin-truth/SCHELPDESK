import { useEffect, useState } from 'react';

export default function FAQWidget() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/faqs/active');
      if (!response.ok) {
        throw new Error('Failed to fetch FAQs');
      }
      const data = await response.json();
      setFaqs(data.data || []);
    } catch (err) {
      console.error('FAQ fetch error:', err);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="faq-widget"><p>Loading FAQs...</p></div>;
  }

  return (
    <div className="faq-widget">
      <h2 className="card-title">Frequently Asked Questions</h2>
      
      <div className="faq-search">
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="faq-search-input"
        />
      </div>

      {error && <div className="error">{error}</div>}

      {filteredFAQs.length === 0 ? (
        <p className="faq-empty">No FAQs found matching your search.</p>
      ) : (
        <div className="faq-list">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="faq-item">
              <div
                className="faq-header"
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              >
                <h3 className="faq-question">
                  {faq.question}
                </h3>
                <span className="faq-category">{faq.category}</span>
                <span className="faq-toggle">
                  {expandedId === faq.id ? '−' : '+'}
                </span>
              </div>
              {expandedId === faq.id && (
                <div className="faq-answer">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

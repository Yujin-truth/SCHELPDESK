import { useEffect, useState } from 'react';
import API from '../services/api';

export default function AnnouncementsWidget() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get('/announcements');
      setAnnouncements(res.data.slice(0, 3)); // Show latest 3
    } catch (err) {
      console.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading announcements...</p>;

  return (
    <div className="announcements">
      <h4>Latest Announcements</h4>
      {announcements.length === 0 ? (
        <p>No announcements yet.</p>
      ) : (
        announcements.map(ann => (
          <div key={ann.id} className="announcement">
            <h5>{ann.title}</h5>
            <p>{ann.message}</p>
            <small>By {ann.createdBy?.name} • {new Date(ann.createdAt).toLocaleDateString()}</small>
          </div>
        ))
      )}
    </div>
  );
}
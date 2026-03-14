import API from '../services/api';

export default function DocumentsWidget() {
  const docs = [
    { label: 'Student Handbook', href: '/docs/Student_Handbook.pdf', resource: 'Student_Handbook.pdf' },
    { label: 'Examination Regulations', href: '/docs/Exam_Regulations.pdf', resource: 'Exam_Regulations.pdf' },
    { label: 'ICT Policy', href: '/docs/ICT_Policy.pdf', resource: 'ICT_Policy.pdf' },
  ];

  const handleDownload = async (doc) => {
    try {
      await API.post('/audit', { action: 'download', resource: doc.resource });
    } catch (err) {
      console.error('Failed to log download:', err);
    }
    // Proceed to download
    window.open(doc.href, '_blank');
  };

  return (
    <div className="documents-widget">
      <h4>Downloadable Documents</h4>
      <ul>
        {docs.map((doc) => (
          <li key={doc.href}>
            <button onClick={() => handleDownload(doc)} className="link-button">
              {doc.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

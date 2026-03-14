import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfileSettingsModal({ open, onClose }) {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: '',
    admissionNumber: '',
    dob: '',
    course: '',
    school: '',
    photo: '',
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        admissionNumber: user.admissionNumber || '',
        dob: user.dob ? new Date(user.dob).toISOString().substr(0, 10) : '',
        course: user.course || '',
        school: user.school || '',
        photo: user.photo || '',
      });
      setPhotoPreview(user.photo || '');
    }
  }, [user, open]);

  const handleProfileChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
      setProfile((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await API.put('/auth/me', profile);
      setUser(res.data.user);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password.newPassword !== password.confirmPassword) {
      setError('New password and confirmation do not match');
      setLoading(false);
      return;
    }

    try {
      await API.post('/auth/change-password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setMessage('Password updated successfully.');
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h3>Settings</h3>
          <button className="modal__close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="modal__tabs">
          <button
            className={tab === 'profile' ? 'tab active' : 'tab'}
            onClick={() => setTab('profile')}
          >
            Edit Profile
          </button>
          <button
            className={tab === 'password' ? 'tab active' : 'tab'}
            onClick={() => setTab('password')}
          >
            Change Password
          </button>
        </div>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        {tab === 'profile' ? (
          <form className="modal__form" onSubmit={handleSaveProfile}>
            <label>
              Name
              <input name="name" value={profile.name} onChange={handleProfileChange} required />
            </label>
            <label>
              Admission Number
              <input name="admissionNumber" value={profile.admissionNumber} onChange={handleProfileChange} />
            </label>
            <label>
              Date of Birth
              <input name="dob" type="date" value={profile.dob} onChange={handleProfileChange} />
            </label>
            <label>
              Course
              <input name="course" value={profile.course} onChange={handleProfileChange} />
            </label>
            <label>
              School
              <input name="school" value={profile.school} onChange={handleProfileChange} />
            </label>
            <label>
              Profile Photo
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </label>
            {photoPreview && <img className="profile-photo" src={photoPreview} alt="Preview" />}
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <form className="modal__form" onSubmit={handleChangePassword}>
            <label>
              Current password
              <input
                type="password"
                value={password.currentPassword}
                onChange={(e) => setPassword((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={password.newPassword}
                onChange={(e) => setPassword((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                value={password.confirmPassword}
                onChange={(e) => setPassword((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

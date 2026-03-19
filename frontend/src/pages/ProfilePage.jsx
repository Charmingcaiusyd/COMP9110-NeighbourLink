import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../api/rideOffersApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import SectionCard from '../components/SectionCard.jsx';

function ProfilePage() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    suburb: '',
    bio: '',
    travelPreferences: '',
    trustNotes: '',
  });

  useEffect(() => {
    if (!userId) {
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    getProfile(userId)
      .then((data) => {
        if (!active) {
          return;
        }
        setProfile(data);
        setForm({
          fullName: data.fullName || '',
          phone: data.phone || '',
          suburb: data.suburb || '',
          bio: data.bio || '',
          travelPreferences: data.travelPreferences || '',
          trustNotes: data.trustNotes || '',
        });
      })
      .catch(() => {
        if (active) {
          setError('Unable to load profile right now.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!userId) {
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await updateProfile(userId, {
        fullName: form.fullName,
        phone: form.phone,
        suburb: form.suburb,
        bio: form.bio,
        travelPreferences: form.travelPreferences,
        trustNotes: form.trustNotes,
      });
      setProfile(updated);
      setMessage('Profile updated successfully.');
    } catch (saveError) {
      setError(saveError.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <header>
        <h2>Profile</h2>
        <p>Keep your personal and trust details up to date.</p>
      </header>

      {loading ? <p>Loading profile...</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      {!loading && profile ? (
        <>
          <SectionCard title="Public Profile">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Average rating:</strong> {profile.averageRating ?? 'No ratings yet'}</p>
            <p><strong>Rating count:</strong> {profile.ratingCount ?? 0}</p>
          </SectionCard>

          <SectionCard title="Edit Profile">
            <form className="form-grid" onSubmit={handleSave}>
              <label>
                Full name
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  disabled={saving}
                />
              </label>
              <label>
                Phone
                <input
                  type="text"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  disabled={saving}
                />
              </label>
              <label>
                Suburb
                <input
                  type="text"
                  value={form.suburb}
                  onChange={(event) => updateField('suburb', event.target.value)}
                  disabled={saving}
                />
              </label>
              <label>
                Bio
                <textarea
                  rows="3"
                  value={form.bio}
                  onChange={(event) => updateField('bio', event.target.value)}
                  disabled={saving}
                />
              </label>
              <label>
                Travel preferences
                <textarea
                  rows="3"
                  value={form.travelPreferences}
                  onChange={(event) => updateField('travelPreferences', event.target.value)}
                  disabled={saving}
                />
              </label>
              <label>
                Trust notes
                <textarea
                  rows="3"
                  value={form.trustNotes}
                  onChange={(event) => updateField('trustNotes', event.target.value)}
                  disabled={saving}
                />
              </label>
              {message ? <p>{message}</p> : null}
              <div className="form-actions">
                <button className="btn" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}

export default ProfilePage;

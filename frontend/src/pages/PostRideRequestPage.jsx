import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOneOffRideRequest } from '../api/rideOffersApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import SectionCard from '../components/SectionCard.jsx';

function PostRideRequestPage() {
  const navigate = useNavigate();
  const { userId, role } = useAuth();
  const [form, setForm] = useState({
    origin: 'Box Hill',
    destination: 'Community Hall',
    tripDate: '2026-03-20',
    tripTime: '10:00',
    passengerCount: '2',
    notes: 'Weekend event travel',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (role !== 'RIDER') {
      setError('Only rider accounts can post one-off ride requests.');
      return;
    }

    const passengerCount = Number(form.passengerCount);
    if (!Number.isInteger(passengerCount) || passengerCount < 1) {
      setError('Passenger count must be a whole number of at least 1.');
      return;
    }
    if (!form.origin.trim() || !form.destination.trim() || !form.tripDate || !form.tripTime) {
      setError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createOneOffRideRequest({
        riderId: userId,
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        tripDate: form.tripDate,
        tripTime: form.tripTime,
        passengerCount,
        notes: form.notes.trim() || null,
      });

      navigate('/ride-confirmed', {
        state: {
          oneOffRideRequest: created,
          oneOffInput: {
            ...form,
            passengerCount,
          },
        },
      });
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit ride request right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <header>
        <h2>Post a Ride Request</h2>
        <p>Need a One-Off Trip?</p>
      </header>

      <div className="two-column">
        <SectionCard title="Request Form">
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Pickup suburb
              <input
                type="text"
                placeholder="e.g. Box Hill"
                value={form.origin}
                onChange={(e) => updateField('origin', e.target.value)}
                disabled={submitting}
              />
            </label>
            <label>
              Destination
              <input
                type="text"
                placeholder="e.g. Community Hall"
                value={form.destination}
                onChange={(e) => updateField('destination', e.target.value)}
                disabled={submitting}
              />
            </label>
            <label>
              Trip date
              <input
                type="date"
                value={form.tripDate}
                onChange={(e) => updateField('tripDate', e.target.value)}
                disabled={submitting}
              />
            </label>
            <label>
              Preferred departure time
              <input
                type="time"
                value={form.tripTime}
                onChange={(e) => updateField('tripTime', e.target.value)}
                disabled={submitting}
              />
            </label>
            <label>
              Number of passengers
              <input
                type="number"
                min="1"
                value={form.passengerCount}
                onChange={(e) => updateField('passengerCount', e.target.value)}
                disabled={submitting}
              />
            </label>
            <label>
              Notes to drivers
              <textarea
                rows="3"
                placeholder="Optional notes"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                disabled={submitting}
              />
            </label>
            {error ? <p className="status-error">{error}</p> : null}
            <div className="form-actions">
              <button className="btn" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <Link className="btn btn-secondary" to="/">Cancel</Link>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="How It Works">
          <p>Drivers travelling near your route may respond.</p>
          <p>You can review driver profile details before accepting an offer.</p>
        </SectionCard>
      </div>
    </div>
  );
}

export default PostRideRequestPage;

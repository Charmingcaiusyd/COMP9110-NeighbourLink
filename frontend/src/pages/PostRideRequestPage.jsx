import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOneOffRideRequest } from '../api/rideOffersApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import SectionCard from '../components/SectionCard.jsx';

const DEFAULT_ORIGIN = {
  displayName: 'Box Hill Library, Box Hill, VIC 3128',
  address: 'Box Hill Library',
  state: 'VIC',
  suburb: 'Box Hill',
  postcode: '3128',
  latitude: -37.8183,
  longitude: 145.1256,
};

const DEFAULT_DESTINATION = {
  displayName: 'Box Hill Community Hall, Box Hill, VIC 3128',
  address: 'Box Hill Community Hall',
  state: 'VIC',
  suburb: 'Box Hill',
  postcode: '3128',
  latitude: -37.8179,
  longitude: 145.1249,
};

function extractLocationText(location) {
  if (!location) {
    return '';
  }
  return location.suburb || location.address || location.displayName || '';
}

function PostRideRequestPage() {
  const navigate = useNavigate();
  const { userId, role } = useAuth();
  const [form, setForm] = useState({
    tripDate: '2026-03-20',
    tripTime: '10:00',
    passengerCount: '2',
    notes: 'Weekend event travel',
  });
  const [originLocation, setOriginLocation] = useState(DEFAULT_ORIGIN);
  const [destinationLocation, setDestinationLocation] = useState(DEFAULT_DESTINATION);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateLocation(location, label) {
    if (!location || !extractLocationText(location)) {
      return `${label} location text is required.`;
    }
    if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
      return `${label} location must include a map point (latitude/longitude).`;
    }
    return null;
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

    const originValidationError = validateLocation(originLocation, 'Origin');
    if (originValidationError) {
      setError(originValidationError);
      return;
    }
    const destinationValidationError = validateLocation(destinationLocation, 'Destination');
    if (destinationValidationError) {
      setError(destinationValidationError);
      return;
    }

    if (!form.tripDate || !form.tripTime) {
      setError('Please complete trip date and preferred departure time.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createOneOffRideRequest({
        riderId: userId,
        origin: extractLocationText(originLocation),
        originAddress: originLocation.address || originLocation.displayName || null,
        originState: originLocation.state || null,
        originSuburb: originLocation.suburb || null,
        originPostcode: originLocation.postcode || null,
        originLatitude: originLocation.latitude,
        originLongitude: originLocation.longitude,
        destination: extractLocationText(destinationLocation),
        destinationAddress: destinationLocation.address || destinationLocation.displayName || null,
        destinationState: destinationLocation.state || null,
        destinationSuburb: destinationLocation.suburb || null,
        destinationPostcode: destinationLocation.postcode || null,
        destinationLatitude: destinationLocation.latitude,
        destinationLongitude: destinationLocation.longitude,
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
            origin: extractLocationText(originLocation),
            destination: extractLocationText(destinationLocation),
            originAddress: originLocation.address,
            destinationAddress: destinationLocation.address,
            originLatitude: originLocation.latitude,
            originLongitude: originLocation.longitude,
            destinationLatitude: destinationLocation.latitude,
            destinationLongitude: destinationLocation.longitude,
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
        <p>Need a one-off trip with exact address and map pin?</p>
      </header>

      <div className="two-column">
        <SectionCard title="Request Form">
          <form className="form-grid" onSubmit={handleSubmit}>
            <LocationPicker
              title="Origin (pickup)"
              value={originLocation}
              onChange={setOriginLocation}
              disabled={submitting}
              placeholder="Search origin in Australia"
            />

            <LocationPicker
              title="Destination"
              value={destinationLocation}
              onChange={setDestinationLocation}
              disabled={submitting}
              placeholder="Search destination in Australia"
            />

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
          <p>Search Australian locations by suburb, postcode, or detailed address.</p>
          <p>Click map to pick exact points, then confirm text address for driver clarity.</p>
          <p>After matching, route overview can show start and end points with direction.</p>
        </SectionCard>
      </div>
    </div>
  );
}

export default PostRideRequestPage;

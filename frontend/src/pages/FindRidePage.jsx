import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker.jsx';
import SectionCard from '../components/SectionCard.jsx';

const DEFAULT_ORIGIN = {
  displayName: 'Clayton Railway Station, Clayton, VIC 3168',
  address: 'Clayton Railway Station',
  state: 'VIC',
  suburb: 'Clayton',
  postcode: '3168',
  latitude: -37.9241,
  longitude: 145.1207,
};

const DEFAULT_DESTINATION = {
  displayName: 'Melbourne CBD, Melbourne, VIC 3000',
  address: 'Melbourne CBD',
  state: 'VIC',
  suburb: 'Melbourne',
  postcode: '3000',
  latitude: -37.8136,
  longitude: 144.9631,
};

function extractLocationText(location) {
  if (!location) {
    return '';
  }
  return location.suburb || location.address || location.displayName || '';
}

function FindRidePage() {
  const navigate = useNavigate();
  const [originLocation, setOriginLocation] = useState(DEFAULT_ORIGIN);
  const [destinationLocation, setDestinationLocation] = useState(DEFAULT_DESTINATION);
  const [form, setForm] = useState({
    departureDate: '2026-03-18',
    departureTime: '',
    passengerCount: '1',
  });

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    const origin = extractLocationText(originLocation);
    const destination = extractLocationText(destinationLocation);
    if (origin) {
      params.set('origin', origin);
    }
    if (destination) {
      params.set('destination', destination);
    }
    Object.entries(form).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.set(key, value.trim());
      }
    });
    navigate(`/search-results?${params.toString()}`);
  }

  return (
    <div className="page-stack">
      <header>
        <h2>Find a Ride</h2>
        <p>Find a ride in your community with map-backed location search.</p>
      </header>

      <SectionCard title="Search Criteria">
        <form className="form-grid" onSubmit={handleSearch}>
          <LocationPicker
            title="Origin"
            value={originLocation}
            onChange={setOriginLocation}
            placeholder="Search pickup suburb/postcode/address"
          />
          <LocationPicker
            title="Destination"
            value={destinationLocation}
            onChange={setDestinationLocation}
            placeholder="Search destination suburb/postcode/address"
          />
          <label>
            Date
            <input
              type="date"
              value={form.departureDate}
              onChange={(e) => updateField('departureDate', e.target.value)}
            />
          </label>
          <label>
            Departure time
            <input
              type="time"
              value={form.departureTime}
              onChange={(e) => updateField('departureTime', e.target.value)}
            />
          </label>
          <label>
            Number of passengers
            <input
              type="number"
              min="1"
              value={form.passengerCount}
              onChange={(e) => updateField('passengerCount', e.target.value)}
            />
          </label>
          <div className="form-actions">
            <button className="btn" type="submit">Search Available Rides</button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Notes">
        <p>Map click is supported for precise pickup and destination points.</p>
        <p>Driver trust information remains available before you submit join requests.</p>
        <p>
          Need a one-off ride? <Link to="/post-ride-request">Post a request</Link>
        </p>
      </SectionCard>
    </div>
  );
}

export default FindRidePage;

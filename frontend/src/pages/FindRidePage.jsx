import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SectionCard from '../components/SectionCard.jsx';

function FindRidePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    origin: 'Clayton',
    destination: 'City Centre',
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
        <p>Find a Ride in Your Community</p>
      </header>

      <SectionCard title="Search Criteria">
        <form className="form-grid" onSubmit={handleSearch}>
          <label>
            Pickup suburb
            <input
              type="text"
              placeholder="e.g. Clayton"
              value={form.origin}
              onChange={(e) => updateField('origin', e.target.value)}
            />
          </label>
          <label>
            Destination
            <input
              type="text"
              placeholder="e.g. City Centre"
              value={form.destination}
              onChange={(e) => updateField('destination', e.target.value)}
            />
          </label>
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
        <p>View driver ratings before you request.</p>
        <p>Only rides with enough available seats will be shown.</p>
        <p>
          Need a one-off ride? <Link to="/post-ride-request">Post a request</Link>
        </p>
      </SectionCard>
    </div>
  );
}

export default FindRidePage;

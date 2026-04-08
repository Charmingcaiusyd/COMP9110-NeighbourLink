import { useRef, useState } from 'react';
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

function toIsoDate(daysToAdd = 0) {
  const value = new Date();
  value.setDate(value.getDate() + daysToAdd);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function extractLocationText(location) {
  if (!location) {
    return '';
  }
  return location.suburb || location.address || location.displayName || '';
}

function hasValidMapPoint(location) {
  return Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude);
}

function FindRidePage() {
  const navigate = useNavigate();
  const confirmRequestedRef = useRef(false);
  const [flowStep, setFlowStep] = useState('ORIGIN');
  const [originLocation, setOriginLocation] = useState(DEFAULT_ORIGIN);
  const [destinationLocation, setDestinationLocation] = useState(DEFAULT_DESTINATION);
  const [form, setForm] = useState({
    departureDate: toIsoDate(1),
    departureTime: '',
    passengerCount: '1',
  });
  const [error, setError] = useState('');

  const originReady = Boolean(extractLocationText(originLocation)) && hasValidMapPoint(originLocation);
  const destinationReady = Boolean(extractLocationText(destinationLocation)) && hasValidMapPoint(destinationLocation);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function canAccessStep(step) {
    if (step === 'ORIGIN') {
      return true;
    }
    if (step === 'DESTINATION') {
      return originReady;
    }
    if (step === 'TRIP') {
      return originReady && destinationReady;
    }
    return false;
  }

  function jumpToStep(step) {
    if (canAccessStep(step)) {
      setError('');
      setFlowStep(step);
    }
  }

  function validateOrigin() {
    if (!extractLocationText(originLocation)) {
      return 'Origin (pickup) is required before moving to destination.';
    }
    if (!hasValidMapPoint(originLocation)) {
      return 'Origin (pickup) must include a selected map point.';
    }
    return '';
  }

  function validateDestination() {
    if (!extractLocationText(destinationLocation)) {
      return 'Destination is required before setting trip date.';
    }
    if (!hasValidMapPoint(destinationLocation)) {
      return 'Destination must include a selected map point.';
    }
    return '';
  }

  function validateTripFields() {
    if (!form.departureDate) {
      return 'Trip date is required.';
    }
    const passengerCount = Number(form.passengerCount);
    if (!Number.isInteger(passengerCount) || passengerCount < 1) {
      return 'Number of passengers must be at least 1.';
    }
    return '';
  }

  function handleNext() {
    setError('');
    if (flowStep === 'ORIGIN') {
      const originError = validateOrigin();
      if (originError) {
        setError(originError);
        return;
      }
      setFlowStep('DESTINATION');
      return;
    }
    if (flowStep === 'DESTINATION') {
      const destinationError = validateDestination();
      if (destinationError) {
        setError(destinationError);
        return;
      }
      setFlowStep('TRIP');
    }
  }

  function handleBack() {
    setError('');
    if (flowStep === 'TRIP') {
      setFlowStep('DESTINATION');
      return;
    }
    if (flowStep === 'DESTINATION') {
      setFlowStep('ORIGIN');
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    // Only allow submit from explicit Confirm button click.
    if (!confirmRequestedRef.current) {
      return;
    }
    confirmRequestedRef.current = false;
    setError('');

    const originError = validateOrigin();
    if (originError) {
      setFlowStep('ORIGIN');
      setError(originError);
      return;
    }

    const destinationError = validateDestination();
    if (destinationError) {
      setFlowStep('DESTINATION');
      setError(destinationError);
      return;
    }

    const tripError = validateTripFields();
    if (tripError) {
      setFlowStep('TRIP');
      setError(tripError);
      return;
    }

    const params = new URLSearchParams();
    const origin = extractLocationText(originLocation);
    const destination = extractLocationText(destinationLocation);
    if (origin) {
      params.set('origin', origin);
    }
    if (destination) {
      params.set('destination', destination);
    }
    if (form.departureDate?.trim()) {
      params.set('departureDate', form.departureDate.trim());
    }
    if (form.departureTime?.trim()) {
      params.set('departureTime', form.departureTime.trim());
    }
    if (form.passengerCount?.trim()) {
      params.set('passengerCount', form.passengerCount.trim());
    }

    navigate(`/search-results?${params.toString()}`);
  }

  return (
    <div className="page-stack">
      <header>
        <h2>Find a Ride</h2>
        <p>Step-by-step flow: Origin, Destination, then Trip date.</p>
      </header>

      <SectionCard title="Search Flow">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="flow-step-tabs">
            <button
              type="button"
              className={`flow-step-tab ${flowStep === 'ORIGIN' ? 'is-active' : ''}`}
              onClick={() => jumpToStep('ORIGIN')}
            >
              Origin (pickup)
            </button>
            <button
              type="button"
              className={`flow-step-tab ${flowStep === 'DESTINATION' ? 'is-active' : ''}`}
              onClick={() => jumpToStep('DESTINATION')}
              disabled={!canAccessStep('DESTINATION')}
            >
              Destination
            </button>
            <button
              type="button"
              className={`flow-step-tab ${flowStep === 'TRIP' ? 'is-active' : ''}`}
              onClick={() => jumpToStep('TRIP')}
              disabled={!canAccessStep('TRIP')}
            >
              Trip Date
            </button>
          </div>

          {flowStep === 'ORIGIN' ? (
            <div className="flow-step-panel">
              <LocationPicker
                title="Origin (pickup)"
                value={originLocation}
                onChange={setOriginLocation}
                placeholder="Search pickup suburb/postcode/address"
              />
            </div>
          ) : null}

          {flowStep === 'DESTINATION' ? (
            <div className="flow-step-panel">
              <p className="status-note">
                <strong>Current origin:</strong> {extractLocationText(originLocation)}.
                If this is wrong, click step 1 to edit.
              </p>
              <LocationPicker
                title="Destination"
                value={destinationLocation}
                onChange={setDestinationLocation}
                placeholder="Search destination suburb/postcode/address"
              />
            </div>
          ) : null}

          {flowStep === 'TRIP' ? (
            <div className="flow-step-panel">
              <p className="status-note">
                <strong>Origin:</strong> {extractLocationText(originLocation)} | <strong>Destination:</strong> {extractLocationText(destinationLocation)}
              </p>
              <div className="flow-summary-grid">
                <label>
                  Trip date
                  <input
                    type="date"
                    value={form.departureDate}
                    onChange={(event) => updateField('departureDate', event.target.value)}
                  />
                </label>
                <label>
                  Departure time (optional)
                  <input
                    type="time"
                    value={form.departureTime}
                    onChange={(event) => updateField('departureTime', event.target.value)}
                  />
                </label>
                <label>
                  Number of passengers
                  <input
                    type="number"
                    min="1"
                    value={form.passengerCount}
                    onChange={(event) => updateField('passengerCount', event.target.value)}
                  />
                </label>
              </div>
            </div>
          ) : null}

          {error ? <p className="status-error">{error}</p> : null}

          <div className="form-actions">
            {flowStep !== 'ORIGIN' ? (
              <button className="btn btn-secondary" type="button" onClick={handleBack}>
                Back
              </button>
            ) : null}
            {flowStep !== 'TRIP' ? (
              <button className="btn" type="button" onClick={handleNext}>
                Continue
              </button>
            ) : (
              <button
                className="btn"
                type="submit"
                onClick={() => {
                  confirmRequestedRef.current = true;
                }}
              >
                Confirm Flow
              </button>
            )}
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Notes">
        <p>You can go back to earlier steps any time if origin or destination needs correction.</p>
        <p>After confirmation, this flow opens Search Results with your selected filters.</p>
        <p>
          Need a one-off ride instead? <Link to="/post-ride-request">Post a request</Link>
        </p>
      </SectionCard>
    </div>
  );
}

export default FindRidePage;

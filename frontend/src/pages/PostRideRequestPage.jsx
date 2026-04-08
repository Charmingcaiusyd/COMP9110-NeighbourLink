import { useEffect, useRef, useState } from 'react';
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

function PostRideRequestPage() {
  const navigate = useNavigate();
  const redirectTimerRef = useRef(null);
  const confirmRequestedRef = useRef(false);
  const { userId, role } = useAuth();
  const [flowStep, setFlowStep] = useState('ORIGIN');
  const [form, setForm] = useState({
    tripDate: toIsoDate(1),
    tripTime: '10:00',
    passengerCount: '2',
    notes: 'Weekend event travel',
  });
  const [originLocation, setOriginLocation] = useState(DEFAULT_ORIGIN);
  const [destinationLocation, setDestinationLocation] = useState(DEFAULT_DESTINATION);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const flowLocked = submitting || Boolean(successMessage);

  const originReady = Boolean(extractLocationText(originLocation)) && hasValidMapPoint(originLocation);
  const destinationReady = Boolean(extractLocationText(destinationLocation)) && hasValidMapPoint(destinationLocation);

  useEffect(() => () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
  }, []);

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
    if (canAccessStep(step) && !flowLocked) {
      setError('');
      setFlowStep(step);
    }
  }

  function validateLocation(location, label) {
    if (!location || !extractLocationText(location)) {
      return `${label} location text is required.`;
    }
    if (!hasValidMapPoint(location)) {
      return `${label} location must include a map point (latitude/longitude).`;
    }
    return '';
  }

  function validateTripDetails() {
    const passengerCount = Number(form.passengerCount);
    if (!Number.isInteger(passengerCount) || passengerCount < 1) {
      return 'Passenger count must be a whole number of at least 1.';
    }
    if (!form.tripDate || !form.tripTime) {
      return 'Please complete trip date and preferred departure time.';
    }
    return '';
  }

  function handleNext() {
    if (flowLocked) {
      return;
    }
    setError('');
    if (flowStep === 'ORIGIN') {
      const originError = validateLocation(originLocation, 'Origin');
      if (originError) {
        setError(originError);
        return;
      }
      setFlowStep('DESTINATION');
      return;
    }
    if (flowStep === 'DESTINATION') {
      const destinationError = validateLocation(destinationLocation, 'Destination');
      if (destinationError) {
        setError(destinationError);
        return;
      }
      setFlowStep('TRIP');
    }
  }

  function handleBack() {
    if (flowLocked) {
      return;
    }
    setError('');
    if (flowStep === 'TRIP') {
      setFlowStep('DESTINATION');
      return;
    }
    if (flowStep === 'DESTINATION') {
      setFlowStep('ORIGIN');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (flowLocked) {
      return;
    }
    // Only allow submit from explicit Confirm button click.
    if (!confirmRequestedRef.current) {
      return;
    }
    confirmRequestedRef.current = false;
    setError('');

    if (role !== 'RIDER') {
      setError('Only rider accounts can post one-off ride requests.');
      return;
    }

    const originValidationError = validateLocation(originLocation, 'Origin');
    if (originValidationError) {
      setFlowStep('ORIGIN');
      setError(originValidationError);
      return;
    }

    const destinationValidationError = validateLocation(destinationLocation, 'Destination');
    if (destinationValidationError) {
      setFlowStep('DESTINATION');
      setError(destinationValidationError);
      return;
    }

    const tripValidationError = validateTripDetails();
    if (tripValidationError) {
      setFlowStep('TRIP');
      setError(tripValidationError);
      return;
    }

    const passengerCount = Number(form.passengerCount);

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

      setSuccessMessage(`Request #${created.requestId} submitted successfully. Redirecting to My Trips in 3 seconds...`);
      redirectTimerRef.current = setTimeout(() => {
        navigate('/my-trips', {
          state: {
            focus: 'REQUEST_HISTORY',
            createdRequestId: created.requestId,
          },
        });
      }, 3000);
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit ride request right now.');
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  }

  return (
    <div className="page-stack">
      <header>
        <h2>Post a Ride Request</h2>
        <p>Step-by-step flow: Origin, Destination, then Trip date confirmation.</p>
      </header>

      <div className="two-column">
        <SectionCard title="Request Flow">
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="flow-step-tabs">
              <button
                type="button"
                className={`flow-step-tab ${flowStep === 'ORIGIN' ? 'is-active' : ''}`}
                onClick={() => jumpToStep('ORIGIN')}
                disabled={flowLocked}
              >
                Origin (pickup)
              </button>
              <button
                type="button"
                className={`flow-step-tab ${flowStep === 'DESTINATION' ? 'is-active' : ''}`}
                onClick={() => jumpToStep('DESTINATION')}
                disabled={!canAccessStep('DESTINATION') || flowLocked}
              >
                Destination
              </button>
              <button
                type="button"
                className={`flow-step-tab ${flowStep === 'TRIP' ? 'is-active' : ''}`}
                onClick={() => jumpToStep('TRIP')}
                disabled={!canAccessStep('TRIP') || flowLocked}
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
                  disabled={flowLocked}
                  placeholder="Search origin in Australia"
                />
              </div>
            ) : null}

            {flowStep === 'DESTINATION' ? (
              <div className="flow-step-panel">
                <p className="status-note">
                  <strong>Current origin:</strong> {extractLocationText(originLocation)}.
                  You can return to step 1 to edit.
                </p>
                <LocationPicker
                  title="Destination"
                  value={destinationLocation}
                  onChange={setDestinationLocation}
                  disabled={flowLocked}
                  placeholder="Search destination in Australia"
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
                      value={form.tripDate}
                      onChange={(event) => updateField('tripDate', event.target.value)}
                      disabled={flowLocked}
                    />
                  </label>
                  <label>
                    Preferred departure time
                    <input
                      type="time"
                      value={form.tripTime}
                      onChange={(event) => updateField('tripTime', event.target.value)}
                      disabled={flowLocked}
                    />
                  </label>
                  <label>
                    Number of passengers
                    <input
                      type="number"
                      min="1"
                      value={form.passengerCount}
                      onChange={(event) => updateField('passengerCount', event.target.value)}
                      disabled={flowLocked}
                    />
                  </label>
                  <label>
                    Notes to drivers
                    <textarea
                      rows="3"
                      placeholder="Optional notes"
                      value={form.notes}
                      onChange={(event) => updateField('notes', event.target.value)}
                      disabled={flowLocked}
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {error ? <p className="status-error">{error}</p> : null}
            {successMessage ? <p className="status-success">{successMessage}</p> : null}
            <div className="form-actions">
              {flowStep !== 'ORIGIN' ? (
                <button className="btn btn-secondary" type="button" onClick={handleBack} disabled={flowLocked}>
                  Back
                </button>
              ) : null}
              {flowStep !== 'TRIP' ? (
                <button className="btn" type="button" onClick={handleNext} disabled={flowLocked}>
                  Continue
                </button>
              ) : (
                <button
                  className="btn"
                  type="submit"
                  disabled={flowLocked}
                  onClick={() => {
                    confirmRequestedRef.current = true;
                  }}
                >
                  {submitting ? 'Submitting...' : 'Confirm and Submit'}
                </button>
              )}
              <Link
                className="btn btn-secondary"
                to="/"
                aria-disabled={flowLocked}
                onClick={(event) => {
                  if (flowLocked) {
                    event.preventDefault();
                  }
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="How It Works">
          <p>Step 1 sets pickup origin, step 2 sets destination, and step 3 finalizes trip details.</p>
          <p>If any step is wrong, you can jump back to earlier tabs and update it.</p>
          <p>After successful submit, this page keeps a success message for 3 seconds then opens My Trips.</p>
        </SectionCard>
      </div>
    </div>
  );
}

export default PostRideRequestPage;

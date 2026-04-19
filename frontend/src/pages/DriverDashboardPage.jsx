import { useEffect, useState } from 'react';
import {
  createRideOffer,
  createRideRequestOffer,
  decideJoinRequest,
  getDriverRideOffers,
  getDriverRideRequestOffers,
  getPendingJoinRequests,
  listOpenRideRequests,
} from '../api/rideOffersApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import OneOffMeetingPointMap from '../components/OneOffMeetingPointMap.jsx';
import SectionCard from '../components/SectionCard.jsx';

function resolveRideRequestId(rideRequest) {
  const candidate = rideRequest?.rideRequestId ?? rideRequest?.requestId;
  const normalized = Number(candidate);
  return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
}

function resolveRideRequestKey(rideRequest) {
  const requestId = resolveRideRequestId(rideRequest);
  if (requestId) {
    return String(requestId);
  }
  return `${rideRequest?.riderId || 'unknown'}-${rideRequest?.tripDate || 'date'}-${rideRequest?.tripTime || 'time'}-${rideRequest?.origin || 'origin'}`;
}

const DEFAULT_RIDE_OFFER_ORIGIN = {
  displayName: 'Clayton Railway Station, Clayton, VIC 3168',
  address: 'Clayton Railway Station',
  state: 'VIC',
  suburb: 'Clayton',
  postcode: '3168',
  latitude: -37.9241,
  longitude: 145.1207,
};

const DEFAULT_RIDE_OFFER_DESTINATION = {
  displayName: 'Melbourne CBD, Melbourne, VIC 3000',
  address: 'Melbourne CBD',
  state: 'VIC',
  suburb: 'Melbourne',
  postcode: '3000',
  latitude: -37.8136,
  longitude: 144.9631,
};

function toIsoDate(daysToAdd = 1) {
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

function DriverDashboardPage() {
  const { userId, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingJoinRequests, setPendingJoinRequests] = useState([]);
  const [openRideRequests, setOpenRideRequests] = useState([]);
  const [driverOfferHistory, setDriverOfferHistory] = useState([]);
  const [driverRideOffers, setDriverRideOffers] = useState([]);
  const [rideOfferOrigin, setRideOfferOrigin] = useState(DEFAULT_RIDE_OFFER_ORIGIN);
  const [rideOfferDestination, setRideOfferDestination] = useState(DEFAULT_RIDE_OFFER_DESTINATION);
  const [rideOfferForm, setRideOfferForm] = useState({
    departureDate: toIsoDate(1),
    departureTime: '08:30',
    availableSeats: '2',
  });
  const [rideOfferSubmitting, setRideOfferSubmitting] = useState(false);
  const [rideOfferError, setRideOfferError] = useState('');
  const [rideOfferMessage, setRideOfferMessage] = useState('');
  const [joinActionState, setJoinActionState] = useState({});
  const [offerActionState, setOfferActionState] = useState({});

  async function loadDashboardData(activeGuard = { active: true }) {
    const [pendingData, openData, offerHistoryData, rideOfferData] = await Promise.all([
      getPendingJoinRequests(userId),
      listOpenRideRequests(),
      getDriverRideRequestOffers(userId),
      getDriverRideOffers(userId),
    ]);
    if (!activeGuard.active) {
      return;
    }
    setPendingJoinRequests(Array.isArray(pendingData) ? pendingData : []);
    setOpenRideRequests(Array.isArray(openData) ? openData : []);
    setDriverOfferHistory(Array.isArray(offerHistoryData) ? offerHistoryData : []);
    setDriverRideOffers(Array.isArray(rideOfferData) ? rideOfferData : []);
  }

  useEffect(() => {
    if (role !== 'DRIVER') {
      setLoading(false);
      setError('Only driver accounts can access this dashboard.');
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    loadDashboardData({ active })
      .catch(() => {
        if (!active) {
          return;
        }
        setError('Unable to load driver dashboard data right now.');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [role, userId]);

  function getJoinFormState(joinRequestId) {
    return joinActionState[joinRequestId] || {
      decision: 'ACCEPTED',
      meetingPoint: '',
      submitting: false,
      message: '',
      error: '',
    };
  }

  function updateJoinState(joinRequestId, patch) {
    setJoinActionState((prev) => ({
      ...prev,
      [joinRequestId]: {
        ...getJoinFormState(joinRequestId),
        ...patch,
      },
    }));
  }

  async function handleJoinDecision(joinRequestId) {
    const form = getJoinFormState(joinRequestId);
    if (form.decision === 'ACCEPTED' && !form.meetingPoint.trim()) {
      updateJoinState(joinRequestId, {
        error: 'Meeting point is required when accepting a join request.',
      });
      return;
    }
    updateJoinState(joinRequestId, { submitting: true, error: '', message: '' });
    try {
      const response = await decideJoinRequest(userId, joinRequestId, {
        decision: form.decision,
        meetingPoint: form.decision === 'ACCEPTED' ? form.meetingPoint.trim() || null : null,
      });
      setPendingJoinRequests((prev) => prev.filter((item) => item.joinRequestId !== joinRequestId));
      updateJoinState(joinRequestId, {
        submitting: false,
        message: `Updated to ${response.status}.`,
      });
    } catch (submitError) {
      updateJoinState(joinRequestId, {
        submitting: false,
        error: submitError.message || 'Unable to update request.',
      });
    }
  }

  function getOfferFormState(requestId, passengerCount) {
    return offerActionState[requestId] || {
      proposedSeats: String(passengerCount || 1),
      meetingPoint: '',
      submitting: false,
      message: '',
      error: '',
    };
  }

  function updateOfferState(requestId, passengerCount, patch) {
    setOfferActionState((prev) => ({
      ...prev,
      [requestId]: {
        ...getOfferFormState(requestId, passengerCount),
        ...patch,
      },
    }));
  }

  async function handleOfferSubmit(rideRequest) {
    const requestId = resolveRideRequestId(rideRequest);
    const requestKey = resolveRideRequestKey(rideRequest);
    if (!requestId) {
      updateOfferState(requestKey, rideRequest.passengerCount, {
        error: 'Ride request id is missing. Please refresh the page.',
      });
      return;
    }
    const form = getOfferFormState(requestKey, rideRequest.passengerCount);
    const proposedSeats = Number(form.proposedSeats);
    if (!Number.isInteger(proposedSeats) || proposedSeats < 1) {
      updateOfferState(requestKey, rideRequest.passengerCount, {
        error: 'Proposed seats must be at least 1.',
      });
      return;
    }
    if (!form.meetingPoint.trim()) {
      updateOfferState(requestKey, rideRequest.passengerCount, {
        error: 'Meeting point is required so the rider can confirm clearly.',
      });
      return;
    }

    const existingPendingOffer = driverOfferHistory.find(
      (offer) => Number(offer.requestId) === Number(requestId) && offer.status === 'PENDING',
    );
    if (existingPendingOffer) {
      updateOfferState(requestKey, rideRequest.passengerCount, {
        message: `You already submitted offer #${existingPendingOffer.offerId} for this request.`,
        error: '',
      });
      return;
    }

    updateOfferState(requestKey, rideRequest.passengerCount, {
      submitting: true,
      error: '',
      message: '',
    });

    try {
      const response = await createRideRequestOffer(requestId, {
        driverId: userId,
        proposedSeats,
        meetingPoint: form.meetingPoint.trim(),
      });
      const latestOfferHistory = await getDriverRideRequestOffers(userId);
      setDriverOfferHistory(Array.isArray(latestOfferHistory) ? latestOfferHistory : []);
      updateOfferState(requestKey, rideRequest.passengerCount, {
        submitting: false,
        message: `Offer #${response.offerId} submitted.`,
      });
    } catch (submitError) {
      updateOfferState(requestKey, rideRequest.passengerCount, {
        submitting: false,
        error: submitError.message || 'Unable to submit offer.',
      });
    }
  }

  function updateRideOfferField(name, value) {
    setRideOfferForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handlePublishRideOffer(event) {
    event.preventDefault();
    setRideOfferError('');
    setRideOfferMessage('');

    const origin = extractLocationText(rideOfferOrigin);
    const destination = extractLocationText(rideOfferDestination);
    if (!origin) {
      setRideOfferError('Origin (pickup) is required.');
      return;
    }
    if (!destination) {
      setRideOfferError('Destination is required.');
      return;
    }
    if (!hasValidMapPoint(rideOfferOrigin)) {
      setRideOfferError('Origin must include a valid map point.');
      return;
    }
    if (!hasValidMapPoint(rideOfferDestination)) {
      setRideOfferError('Destination must include a valid map point.');
      return;
    }
    if (!rideOfferForm.departureDate) {
      setRideOfferError('Departure date is required.');
      return;
    }
    if (!rideOfferForm.departureTime) {
      setRideOfferError('Departure time is required.');
      return;
    }
    const seatCount = Number(rideOfferForm.availableSeats);
    if (!Number.isInteger(seatCount) || seatCount < 1) {
      setRideOfferError('Available seats must be a whole number of at least 1.');
      return;
    }

    setRideOfferSubmitting(true);
    try {
      const created = await createRideOffer({
        driverId: userId,
        origin,
        originAddress: rideOfferOrigin.address || rideOfferOrigin.displayName || null,
        originState: rideOfferOrigin.state || null,
        originSuburb: rideOfferOrigin.suburb || null,
        originPostcode: rideOfferOrigin.postcode || null,
        originLatitude: rideOfferOrigin.latitude,
        originLongitude: rideOfferOrigin.longitude,
        destination,
        destinationAddress: rideOfferDestination.address || rideOfferDestination.displayName || null,
        destinationState: rideOfferDestination.state || null,
        destinationSuburb: rideOfferDestination.suburb || null,
        destinationPostcode: rideOfferDestination.postcode || null,
        destinationLatitude: rideOfferDestination.latitude,
        destinationLongitude: rideOfferDestination.longitude,
        departureDate: rideOfferForm.departureDate,
        departureTime: rideOfferForm.departureTime,
        availableSeats: seatCount,
      });
      const latestRideOffers = await getDriverRideOffers(userId);
      setDriverRideOffers(Array.isArray(latestRideOffers) ? latestRideOffers : []);
      setRideOfferMessage(`Ride offer #${created.offerId} posted successfully.`);
    } catch (submitError) {
      setRideOfferError(submitError.message || 'Unable to publish ride offer.');
    } finally {
      setRideOfferSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <header>
        <h2>Driver Hub</h2>
        <p>Manage rider join requests and respond to open one-off requests.</p>
      </header>

      {loading ? <p>Loading dashboard data...</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <SectionCard title="Post Ride Offer (Self-Service)">
            <form className="form-grid" onSubmit={handlePublishRideOffer}>
              <div className="flow-step-panel">
                <LocationPicker
                  title="Origin (pickup)"
                  value={rideOfferOrigin}
                  onChange={setRideOfferOrigin}
                  disabled={rideOfferSubmitting}
                  placeholder="Search origin suburb/postcode/address"
                />
              </div>
              <div className="flow-step-panel">
                <LocationPicker
                  title="Destination"
                  value={rideOfferDestination}
                  onChange={setRideOfferDestination}
                  disabled={rideOfferSubmitting}
                  placeholder="Search destination suburb/postcode/address"
                />
              </div>
              <div className="flow-summary-grid">
                <label>
                  Departure date
                  <input
                    type="date"
                    value={rideOfferForm.departureDate}
                    onChange={(event) => updateRideOfferField('departureDate', event.target.value)}
                    disabled={rideOfferSubmitting}
                  />
                </label>
                <label>
                  Departure time
                  <input
                    type="time"
                    value={rideOfferForm.departureTime}
                    onChange={(event) => updateRideOfferField('departureTime', event.target.value)}
                    disabled={rideOfferSubmitting}
                  />
                </label>
                <label>
                  Available seats
                  <input
                    type="number"
                    min="1"
                    value={rideOfferForm.availableSeats}
                    onChange={(event) => updateRideOfferField('availableSeats', event.target.value)}
                    disabled={rideOfferSubmitting}
                  />
                </label>
              </div>
              {rideOfferError ? <p className="status-error">{rideOfferError}</p> : null}
              {rideOfferMessage ? <p>{rideOfferMessage}</p> : null}
              <div className="form-actions">
                <button className="btn" type="submit" disabled={rideOfferSubmitting}>
                  {rideOfferSubmitting ? 'Publishing...' : 'Publish Ride Offer'}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="My Posted Ride Offers">
            {driverRideOffers.length === 0 ? (
              <p>You have not posted any ride offers yet.</p>
            ) : (
              <div className="results-grid">
                {driverRideOffers.map((offer) => (
                  <article key={offer.offerId} className="result-card">
                    <p><strong>Offer ID:</strong> {offer.offerId}</p>
                    <p><strong>Route:</strong> {(offer.originAddress || offer.origin)} to {(offer.destinationAddress || offer.destination)}</p>
                    <p><strong>Departure:</strong> {offer.departureDate} {offer.departureTime}</p>
                    <p><strong>Available seats:</strong> {offer.availableSeats}</p>
                    <p><strong>Status:</strong> {offer.status}</p>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Pending Join Requests">
            {pendingJoinRequests.length === 0 ? (
              <p>No pending join requests for this driver.</p>
            ) : (
              <div className="results-grid">
                {pendingJoinRequests.map((item) => {
                  const form = getJoinFormState(item.joinRequestId);
                  return (
                    <article key={item.joinRequestId} className="result-card">
                      <p><strong>Request ID:</strong> {item.joinRequestId}</p>
                      <p><strong>Rider:</strong> {item.riderName}</p>
                      <p><strong>Route:</strong> {item.origin} to {item.destination}</p>
                      <p><strong>Seats requested:</strong> {item.requestedSeats}</p>
                      <p><strong>Current available seats:</strong> {item.availableSeats}</p>
                      <div className="form-grid compact-form">
                        <label>
                          Decision
                          <select
                            value={form.decision}
                            onChange={(event) => updateJoinState(item.joinRequestId, { decision: event.target.value })}
                            disabled={form.submitting}
                          >
                            <option value="ACCEPTED">Accept</option>
                            <option value="REJECTED">Reject</option>
                          </select>
                        </label>
                        <label>
                          Meeting point (when accepting)
                          <input
                            type="text"
                            value={form.meetingPoint}
                            onChange={(event) => updateJoinState(item.joinRequestId, { meetingPoint: event.target.value })}
                            disabled={form.submitting || form.decision === 'REJECTED'}
                          />
                        </label>
                        {form.error ? <p className="status-error">{form.error}</p> : null}
                        {form.message ? <p>{form.message}</p> : null}
                        <div className="form-actions">
                          <button
                            className="btn"
                            type="button"
                            onClick={() => handleJoinDecision(item.joinRequestId)}
                            disabled={form.submitting}
                          >
                            {form.submitting ? 'Submitting...' : 'Submit Decision'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Open One-Off Ride Requests">
            <p className="status-note">
              You can respond only when your driver profile is active, licence-verified, and seat capacity
              covers the proposed seat count.
            </p>
            {openRideRequests.length === 0 ? (
              <p>No open one-off ride requests right now.</p>
            ) : (
              <div className="results-grid">
                {openRideRequests.map((request) => {
                  const requestId = resolveRideRequestId(request);
                  const requestKey = resolveRideRequestKey(request);
                  const form = getOfferFormState(requestKey, request.passengerCount);
                  const existingOffer = driverOfferHistory.find(
                    (offer) => Number(offer.requestId) === Number(requestId) && offer.status === 'PENDING',
                  );
                  return (
                    <article key={requestKey} className="result-card">
                      <p><strong>Request ID:</strong> {requestId || 'Unavailable'}</p>
                      <p><strong>Rider:</strong> {request.riderName}</p>
                      <p><strong>Route:</strong> {request.origin} to {request.destination}</p>
                      <p><strong>Trip:</strong> {request.tripDate} {request.tripTime}</p>
                      <p><strong>Passenger count:</strong> {request.passengerCount}</p>
                      <div className="one-off-meeting-section">
                        <p>
                          <strong>Default meeting point marker:</strong>{' '}
                          Rider origin (you can still type a custom meeting point below).
                        </p>
                        <OneOffMeetingPointMap
                          originLatitude={request.originLatitude}
                          originLongitude={request.originLongitude}
                          originLabel={request.origin}
                          originAddress={request.originAddress}
                        />
                      </div>
                      {request.notes ? <p><strong>Notes:</strong> {request.notes}</p> : null}
                      {existingOffer ? (
                        <p>
                          <strong>Existing response:</strong> Offer #{existingOffer.offerId} is still
                          {' '}<strong>{existingOffer.status}</strong>.
                        </p>
                      ) : null}
                      <div className="form-grid compact-form">
                        <label>
                          Proposed seats
                          <input
                            type="number"
                            min="1"
                            value={form.proposedSeats}
                            onChange={(event) => updateOfferState(
                              requestKey,
                              request.passengerCount,
                              { proposedSeats: event.target.value },
                            )}
                            disabled={form.submitting || Boolean(existingOffer) || !requestId}
                          />
                        </label>
                        <label>
                          Meeting point
                          <input
                            type="text"
                            placeholder="e.g. Box Hill Library front gate"
                            value={form.meetingPoint}
                            onChange={(event) => updateOfferState(
                              requestKey,
                              request.passengerCount,
                              { meetingPoint: event.target.value },
                            )}
                            disabled={form.submitting || Boolean(existingOffer) || !requestId}
                          />
                        </label>
                        {form.error ? <p className="status-error">{form.error}</p> : null}
                        {form.message ? <p>{form.message}</p> : null}
                        <div className="form-actions">
                          <button
                            className="btn"
                            type="button"
                            onClick={() => handleOfferSubmit(request)}
                            disabled={form.submitting || Boolean(existingOffer) || !requestId}
                          >
                            {form.submitting ? 'Submitting...' : 'Respond to Request'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard title="My One-Off Offer History">
            {driverOfferHistory.length === 0 ? (
              <p>You have not submitted one-off request offers yet.</p>
            ) : (
              <div className="results-grid">
                {driverOfferHistory.map((offer) => (
                  <article key={offer.offerId} className="result-card">
                    <p><strong>Offer ID:</strong> {offer.offerId}</p>
                    <p><strong>Request ID:</strong> {offer.requestId}</p>
                    <p><strong>Rider:</strong> {offer.riderName}</p>
                    <p><strong>Route:</strong> {offer.origin} to {offer.destination}</p>
                    <p><strong>Trip:</strong> {offer.tripDate} {offer.tripTime}</p>
                    <p><strong>Proposed seats:</strong> {offer.proposedSeats}</p>
                    <p><strong>Meeting point:</strong> {offer.meetingPoint || 'Not provided'}</p>
                    <p><strong>Status:</strong> {offer.status}</p>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}

export default DriverDashboardPage;

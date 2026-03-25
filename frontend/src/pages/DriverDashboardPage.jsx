import { useEffect, useState } from 'react';
import {
  createRideRequestOffer,
  decideJoinRequest,
  getDriverRideRequestOffers,
  getPendingJoinRequests,
  listOpenRideRequests,
} from '../api/rideOffersApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
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

function DriverDashboardPage() {
  const { userId, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingJoinRequests, setPendingJoinRequests] = useState([]);
  const [openRideRequests, setOpenRideRequests] = useState([]);
  const [driverOfferHistory, setDriverOfferHistory] = useState([]);
  const [joinActionState, setJoinActionState] = useState({});
  const [offerActionState, setOfferActionState] = useState({});

  async function loadDashboardData(activeGuard = { active: true }) {
    const [pendingData, openData, offerHistoryData] = await Promise.all([
      getPendingJoinRequests(userId),
      listOpenRideRequests(),
      getDriverRideRequestOffers(userId),
    ]);
    if (!activeGuard.active) {
      return;
    }
    setPendingJoinRequests(Array.isArray(pendingData) ? pendingData : []);
    setOpenRideRequests(Array.isArray(openData) ? openData : []);
    setDriverOfferHistory(Array.isArray(offerHistoryData) ? offerHistoryData : []);
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

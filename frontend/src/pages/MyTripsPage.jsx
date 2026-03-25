import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  cancelRideRequest,
  createRating,
  getDriverRideRequestOffers,
  getDriverTrips,
  getRiderRideRequests,
  getRiderTrips,
} from '../api/rideOffersApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import SectionCard from '../components/SectionCard.jsx';
import TripRouteMap from '../components/TripRouteMap.jsx';

function isUpcomingTrip(trip, now = new Date()) {
  if (!trip || trip.tripStatus !== 'CONFIRMED' || !trip.tripDate) {
    return false;
  }
  const tripDay = String(trip.tripDate).slice(0, 10);
  const tripTime = /^\d{2}:\d{2}$/.test(trip.tripTime || '') ? trip.tripTime : '00:00';
  const tripDateTime = new Date(`${tripDay}T${tripTime}:00`);
  if (Number.isNaN(tripDateTime.getTime())) {
    return false;
  }
  return tripDateTime.getTime() >= now.getTime();
}

function resolveTripKey(trip) {
  if (trip?.rideMatchId != null) {
    return String(trip.rideMatchId);
  }
  return `${trip?.driverId || 'driver'}-${trip?.riderId || 'rider'}-${trip?.tripDate || 'date'}-${trip?.tripTime || 'time'}`;
}

function resolveRatingTarget(trip, role) {
  if (!trip) {
    return { targetUserId: null, targetName: 'User' };
  }

  if (role === 'RIDER') {
    const driverId = Number(trip.driverId);
    return {
      targetUserId: Number.isInteger(driverId) && driverId > 0 ? driverId : null,
      targetName: trip.driverName || 'Driver',
    };
  }

  const riderId = Number(trip.riderId);
  return {
    targetUserId: Number.isInteger(riderId) && riderId > 0 ? riderId : null,
    targetName: trip.riderName || 'Rider',
  };
}

function MyTripsPage() {
  const { userId, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [driverOfferHistory, setDriverOfferHistory] = useState([]);
  const [tripFilter, setTripFilter] = useState('UPCOMING');
  const [cancellingRequestId, setCancellingRequestId] = useState(null);
  const [requestActionError, setRequestActionError] = useState('');
  const [requestActionMessage, setRequestActionMessage] = useState('');
  const [ratingState, setRatingState] = useState({});

  const filteredTrips = useMemo(() => (
    trips.filter((trip) => (tripFilter === 'UPCOMING' ? isUpcomingTrip(trip) : !isUpcomingTrip(trip)))
  ), [tripFilter, trips]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    const loadData = role === 'DRIVER'
      ? Promise.all([getDriverTrips(userId), getDriverRideRequestOffers(userId)])
      : Promise.all([getRiderTrips(userId), getRiderRideRequests(userId)]);

    loadData
      .then(([tripData, auxData]) => {
        if (active) {
          setTrips(Array.isArray(tripData) ? tripData : []);
          if (role === 'DRIVER') {
            setDriverOfferHistory(Array.isArray(auxData) ? auxData : []);
            setRequestHistory([]);
          } else {
            setRequestHistory(Array.isArray(auxData) ? auxData : []);
            setDriverOfferHistory([]);
          }
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load your trips right now.');
          setTrips([]);
          setRequestHistory([]);
          setDriverOfferHistory([]);
          setRequestActionError('');
          setRequestActionMessage('');
          setRatingState({});
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
  }, [role, userId]);

  async function handleCancelRequest(rideRequestId) {
    if (role !== 'RIDER') {
      return;
    }
    setRequestActionError('');
    setRequestActionMessage('');
    setCancellingRequestId(rideRequestId);
    try {
      const response = await cancelRideRequest(userId, rideRequestId);
      setRequestHistory((prev) => prev.map((item) => (
        item.requestId === rideRequestId
          ? {
              ...item,
              status: response.status,
              pendingOffers: 0,
            }
          : item
      )));
      setRequestActionMessage(`Request #${rideRequestId} is now ${response.status}.`);
    } catch (cancelError) {
      setRequestActionError(cancelError.message || 'Unable to cancel this request.');
    } finally {
      setCancellingRequestId(null);
    }
  }

  function getRatingFormState(tripKey) {
    return ratingState[tripKey] || {
      score: '5',
      comment: '',
      submitting: false,
      error: '',
      message: '',
      submitted: false,
    };
  }

  function updateRatingFormState(tripKey, patch) {
    setRatingState((prev) => ({
      ...prev,
      [tripKey]: {
        ...getRatingFormState(tripKey),
        ...patch,
      },
    }));
  }

  async function handleSubmitRating(trip) {
    const tripKey = resolveTripKey(trip);
    const form = getRatingFormState(tripKey);
    const { targetUserId, targetName } = resolveRatingTarget(trip, role);

    if (!targetUserId) {
      updateRatingFormState(tripKey, {
        error: 'Unable to identify who should be rated for this trip.',
      });
      return;
    }

    const score = Number(form.score);
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      updateRatingFormState(tripKey, {
        error: 'Score must be a whole number from 1 to 5.',
      });
      return;
    }

    updateRatingFormState(tripKey, {
      submitting: true,
      error: '',
      message: '',
    });

    try {
      const response = await createRating({
        raterUserId: userId,
        targetUserId,
        score,
        comment: form.comment.trim() || null,
      });
      const resolvedTargetName = response?.targetUserName || targetName;
      updateRatingFormState(tripKey, {
        submitting: false,
        submitted: true,
        message: `Rated ${resolvedTargetName} with ${score}/5.`,
      });
    } catch (ratingError) {
      updateRatingFormState(tripKey, {
        submitting: false,
        error: ratingError.message || 'Unable to submit rating right now.',
      });
    }
  }

  return (
    <div className="page-stack">
      <header>
        <h2>My Trips</h2>
        <p>Confirmed trips linked to your account.</p>
      </header>

      <SectionCard title="Trip Filter">
        <div className="form-actions">
          <button
            className={tripFilter === 'UPCOMING' ? 'btn' : 'btn btn-secondary'}
            type="button"
            onClick={() => setTripFilter('UPCOMING')}
          >
            Upcoming
          </button>
          <button
            className={tripFilter === 'HISTORY' ? 'btn' : 'btn btn-secondary'}
            type="button"
            onClick={() => setTripFilter('HISTORY')}
          >
            History
          </button>
        </div>
      </SectionCard>

      {loading ? <p>Loading trips...</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      {!loading && !error && trips.length === 0 ? (
        <SectionCard title="No Trips Yet">
          <p>You have no confirmed trips at the moment.</p>
        </SectionCard>
      ) : null}

      {!loading && !error && trips.length > 0 && filteredTrips.length === 0 ? (
        <SectionCard title="No Trips In This Filter">
          <p>No trips match the selected filter right now.</p>
        </SectionCard>
      ) : null}

      {!loading && !error && filteredTrips.length > 0 ? (
        <section className="results-grid">
          {filteredTrips.map((trip) => {
            const tripKey = resolveTripKey(trip);
            const form = getRatingFormState(tripKey);
            const isHistoryTrip = !isUpcomingTrip(trip);
            const canRate = isHistoryTrip && trip.tripStatus === 'CONFIRMED';
            const { targetUserId, targetName } = resolveRatingTarget(trip, role);

            return (
              <article key={tripKey} className="result-card">
                <p><strong>Match ID:</strong> {trip.rideMatchId}</p>
                <p><strong>Type:</strong> {trip.tripType}</p>
                <p><strong>Driver:</strong> {trip.driverName}</p>
                <p><strong>Rider:</strong> {trip.riderName}</p>
                <p><strong>Route:</strong> {(trip.originAddress || trip.origin)} to {(trip.destinationAddress || trip.destination)}</p>
                <p><strong>Date and time:</strong> {trip.tripDate} {trip.tripTime}</p>
                <p><strong>Meeting point:</strong> {trip.meetingPoint || 'Not provided'}</p>
                <p><strong>Status:</strong> {trip.tripStatus}</p>
                <TripRouteMap trip={trip} />

                {canRate ? (
                  <div className="trip-rating-box">
                    <p><strong>Rate this trip partner:</strong> {targetName}</p>
                    <div className="form-grid rating-form">
                      <label>
                        Score
                        <select
                          value={form.score}
                          onChange={(event) => updateRatingFormState(tripKey, { score: event.target.value })}
                          disabled={form.submitting || !targetUserId}
                        >
                          <option value="5">5 - Excellent</option>
                          <option value="4">4 - Good</option>
                          <option value="3">3 - Okay</option>
                          <option value="2">2 - Poor</option>
                          <option value="1">1 - Very poor</option>
                        </select>
                      </label>
                      <label>
                        Comment (optional)
                        <textarea
                          placeholder="Share short feedback to support trust."
                          value={form.comment}
                          onChange={(event) => updateRatingFormState(tripKey, { comment: event.target.value })}
                          maxLength={300}
                          disabled={form.submitting || !targetUserId}
                        />
                      </label>
                      {form.error ? <p className="status-error">{form.error}</p> : null}
                      {form.message ? <p>{form.message}</p> : null}
                      <div className="form-actions">
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => handleSubmitRating(trip)}
                          disabled={form.submitting || !targetUserId}
                        >
                          {form.submitting ? 'Submitting...' : form.submitted ? 'Submit Again' : 'Submit Rating'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : null}

      {!loading && !error && role === 'RIDER' ? (
        <SectionCard title="My One-Off Request History">
          {requestActionError ? <p className="status-error">{requestActionError}</p> : null}
          {requestActionMessage ? <p>{requestActionMessage}</p> : null}
          {requestHistory.length === 0 ? (
            <p>You have not posted one-off ride requests yet.</p>
          ) : (
            <div className="results-grid">
              {requestHistory.map((request) => (
                <article key={request.requestId} className="result-card">
                  <p><strong>Request ID:</strong> {request.requestId}</p>
                  <p><strong>Route:</strong> {request.origin} to {request.destination}</p>
                  <p><strong>Trip:</strong> {request.tripDate} {request.tripTime}</p>
                  <p><strong>Passengers:</strong> {request.passengerCount}</p>
                  <p><strong>Status:</strong> {request.status}</p>
                  <p><strong>Total offers:</strong> {request.totalOffers}</p>
                  <p><strong>Pending offers:</strong> {request.pendingOffers}</p>
                  <div className="form-actions">
                    {request.status !== 'CLOSED' ? (
                      <Link
                        className="btn btn-secondary"
                        to={`/ride-requests/${request.requestId}/offers?riderId=${userId}`}
                      >
                        Review Offers
                      </Link>
                    ) : null}
                    {request.status === 'OPEN' ? (
                      <button
                        className="btn"
                        type="button"
                        onClick={() => handleCancelRequest(request.requestId)}
                        disabled={cancellingRequestId === request.requestId}
                      >
                        {cancellingRequestId === request.requestId ? 'Cancelling...' : 'Cancel Request'}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      ) : null}

      {!loading && !error && role === 'DRIVER' ? (
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
                  <p><strong>Status:</strong> {offer.status}</p>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      ) : null}
    </div>
  );
}

export default MyTripsPage;

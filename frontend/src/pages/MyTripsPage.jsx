import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  cancelRideRequest,
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
          {filteredTrips.map((trip) => (
            <article key={trip.rideMatchId} className="result-card">
              <p><strong>Match ID:</strong> {trip.rideMatchId}</p>
              <p><strong>Type:</strong> {trip.tripType}</p>
              <p><strong>Driver:</strong> {trip.driverName}</p>
              <p><strong>Rider:</strong> {trip.riderName}</p>
              <p><strong>Route:</strong> {(trip.originAddress || trip.origin)} to {(trip.destinationAddress || trip.destination)}</p>
              <p><strong>Date and time:</strong> {trip.tripDate} {trip.tripTime}</p>
              <p><strong>Meeting point:</strong> {trip.meetingPoint || 'Not provided'}</p>
              <p><strong>Status:</strong> {trip.tripStatus}</p>
              <TripRouteMap trip={trip} />
            </article>
          ))}
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

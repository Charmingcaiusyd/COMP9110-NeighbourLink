import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  cancelRideRequest,
  createRating,
  getDriverRideRequestOffers,
  getDriverTrips,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  getRiderJoinRequests,
  getRiderRideRequests,
  getRiderTrips,
} from '../api/rideOffersApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import SectionCard from '../components/SectionCard.jsx';
import TripRouteMap from '../components/TripRouteMap.jsx';

const PAGE_SIZE = 3;

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

function filterTripType(trip, typeFilter) {
  if (typeFilter === 'ALL') {
    return true;
  }
  return trip?.tripType === typeFilter;
}

function filterRequestHistory(item, statusFilter) {
  if (statusFilter === 'ALL') {
    return true;
  }
  return item?.status === statusFilter;
}

function filterJoinRequestHistory(item, statusFilter) {
  if (statusFilter === 'ALL') {
    return true;
  }
  return item?.status === statusFilter;
}

function filterOfferHistory(item, statusFilter) {
  if (statusFilter === 'ALL') {
    return true;
  }
  return item?.status === statusFilter;
}

function getPageCount(items, pageSize = PAGE_SIZE) {
  const count = Math.ceil((items?.length || 0) / pageSize);
  return count > 0 ? count : 1;
}

function paginateItems(items, page, pageSize = PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function toTripTypeLabel(tripType) {
  if (tripType === 'JOIN_REQUEST') {
    return 'Join Request Match';
  }
  if (tripType === 'ONE_OFF_REQUEST') {
    return 'One-Off Request Match';
  }
  return tripType || 'Unknown';
}

function Pager({ page, totalPages, totalItems, onPageChange }) {
  if (totalItems <= PAGE_SIZE) {
    return null;
  }

  return (
    <div className="mini-pager">
      <span>
        Showing page {page} of {totalPages} ({totalItems} items)
      </span>
      <div className="mini-pager-actions">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function MyTripsPage() {
  const { userId, role } = useAuth();
  const location = useLocation();
  const requestHistoryAnchorRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState([]);
  const [joinRequestHistory, setJoinRequestHistory] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [driverOfferHistory, setDriverOfferHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationTab, setNotificationTab] = useState('UNREAD');
  const [notificationPage, setNotificationPage] = useState(1);
  const [markingAllNotifications, setMarkingAllNotifications] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState(null);
  const [notificationActionError, setNotificationActionError] = useState('');
  const [notificationActionMessage, setNotificationActionMessage] = useState('');
  const [tripFilter, setTripFilter] = useState('UPCOMING');
  const [tripTypeFilter, setTripTypeFilter] = useState('ALL');
  const [tripPage, setTripPage] = useState(1);
  const [noTripTab, setNoTripTab] = useState('GUIDE');
  const [joinRequestHistoryTab, setJoinRequestHistoryTab] = useState('PENDING');
  const [joinRequestHistoryPage, setJoinRequestHistoryPage] = useState(1);
  const [requestHistoryTab, setRequestHistoryTab] = useState('ALL');
  const [requestHistoryPage, setRequestHistoryPage] = useState(1);
  const [driverOfferHistoryTab, setDriverOfferHistoryTab] = useState('ALL');
  const [driverOfferHistoryPage, setDriverOfferHistoryPage] = useState(1);
  const [cancellingRequestId, setCancellingRequestId] = useState(null);
  const [requestActionError, setRequestActionError] = useState('');
  const [requestActionMessage, setRequestActionMessage] = useState('');
  const [ratingState, setRatingState] = useState({});

  const hasAuxHistory = useMemo(() => {
    if (role === 'RIDER') {
      return requestHistory.length > 0 || joinRequestHistory.length > 0;
    }
    if (role === 'DRIVER') {
      return driverOfferHistory.length > 0;
    }
    return false;
  }, [driverOfferHistory.length, joinRequestHistory.length, requestHistory.length, role]);

  const arrivalMessage = useMemo(() => {
    const focus = location.state?.focus;
    if (focus === 'REQUEST_HISTORY' && role === 'RIDER') {
      if (location.state?.createdRequestId != null) {
        return `Request #${location.state.createdRequestId} has been created. It appears in "My One-Off Request History" below.`;
      }
      return 'Your request has been created. It appears in "My One-Off Request History" below.';
    }
    return '';
  }, [location.state, role]);

  const filteredTrips = useMemo(() => (
    trips.filter((trip) => (tripFilter === 'UPCOMING' ? isUpcomingTrip(trip) : !isUpcomingTrip(trip)))
  ), [tripFilter, trips]);

  const hasUpcomingTrips = useMemo(
    () => trips.some((trip) => isUpcomingTrip(trip)),
    [trips],
  );

  const hasHistoryTrips = useMemo(
    () => trips.some((trip) => !isUpcomingTrip(trip)),
    [trips],
  );

  const typeFilteredTrips = useMemo(
    () => filteredTrips.filter((trip) => filterTripType(trip, tripTypeFilter)),
    [filteredTrips, tripTypeFilter],
  );

  const tripTotalPages = useMemo(
    () => getPageCount(typeFilteredTrips, PAGE_SIZE),
    [typeFilteredTrips],
  );

  const pagedTrips = useMemo(
    () => paginateItems(typeFilteredTrips, tripPage, PAGE_SIZE),
    [tripPage, typeFilteredTrips],
  );

  const filteredJoinRequestHistory = useMemo(
    () => joinRequestHistory.filter((item) => filterJoinRequestHistory(item, joinRequestHistoryTab)),
    [joinRequestHistory, joinRequestHistoryTab],
  );

  const joinRequestHistoryTotalPages = useMemo(
    () => getPageCount(filteredJoinRequestHistory, PAGE_SIZE),
    [filteredJoinRequestHistory],
  );

  const pagedJoinRequestHistory = useMemo(
    () => paginateItems(filteredJoinRequestHistory, joinRequestHistoryPage, PAGE_SIZE),
    [filteredJoinRequestHistory, joinRequestHistoryPage],
  );

  const filteredRequestHistory = useMemo(
    () => requestHistory.filter((item) => filterRequestHistory(item, requestHistoryTab)),
    [requestHistory, requestHistoryTab],
  );

  const requestHistoryTotalPages = useMemo(
    () => getPageCount(filteredRequestHistory, PAGE_SIZE),
    [filteredRequestHistory],
  );

  const pagedRequestHistory = useMemo(
    () => paginateItems(filteredRequestHistory, requestHistoryPage, PAGE_SIZE),
    [filteredRequestHistory, requestHistoryPage],
  );

  const filteredDriverOfferHistory = useMemo(
    () => driverOfferHistory.filter((item) => filterOfferHistory(item, driverOfferHistoryTab)),
    [driverOfferHistory, driverOfferHistoryTab],
  );

  const driverOfferHistoryTotalPages = useMemo(
    () => getPageCount(filteredDriverOfferHistory, PAGE_SIZE),
    [filteredDriverOfferHistory],
  );

  const pagedDriverOfferHistory = useMemo(
    () => paginateItems(filteredDriverOfferHistory, driverOfferHistoryPage, PAGE_SIZE),
    [filteredDriverOfferHistory, driverOfferHistoryPage],
  );

  const filteredNotifications = useMemo(() => (
    notifications.filter((item) => (notificationTab === 'UNREAD' ? !item.read : true))
  ), [notificationTab, notifications]);

  const notificationTotalPages = useMemo(
    () => getPageCount(filteredNotifications, PAGE_SIZE),
    [filteredNotifications],
  );

  const pagedNotifications = useMemo(
    () => paginateItems(filteredNotifications, notificationPage, PAGE_SIZE),
    [filteredNotifications, notificationPage],
  );

  useEffect(() => {
    if (!userId) {
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    const loadData = role === 'DRIVER'
      ? Promise.all([getDriverTrips(userId), getDriverRideRequestOffers(userId), getUserNotifications(userId, false)])
      : Promise.all([
          getRiderTrips(userId),
          getRiderRideRequests(userId),
          getRiderJoinRequests(userId),
          getUserNotifications(userId, false),
        ]);

    loadData
      .then((loaded) => {
        if (active) {
          if (role === 'DRIVER') {
            const [tripData, offerHistoryData, notificationData] = loaded;
            setTrips(Array.isArray(tripData) ? tripData : []);
            setDriverOfferHistory(Array.isArray(offerHistoryData) ? offerHistoryData : []);
            setJoinRequestHistory([]);
            setRequestHistory([]);
            setNotifications(Array.isArray(notificationData) ? notificationData : []);
          } else {
            const [tripData, oneOffRequestHistoryData, joinRequestHistoryData, notificationData] = loaded;
            setTrips(Array.isArray(tripData) ? tripData : []);
            setRequestHistory(Array.isArray(oneOffRequestHistoryData) ? oneOffRequestHistoryData : []);
            setJoinRequestHistory(Array.isArray(joinRequestHistoryData) ? joinRequestHistoryData : []);
            setDriverOfferHistory([]);
            setNotifications(Array.isArray(notificationData) ? notificationData : []);
          }
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load your trips right now.');
          setTrips([]);
          setJoinRequestHistory([]);
          setRequestHistory([]);
          setDriverOfferHistory([]);
          setNotifications([]);
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

  useEffect(() => {
    setTripPage(1);
  }, [tripFilter, tripTypeFilter]);

  useEffect(() => {
    setJoinRequestHistoryPage(1);
  }, [joinRequestHistoryTab]);

  useEffect(() => {
    setRequestHistoryPage(1);
  }, [requestHistoryTab]);

  useEffect(() => {
    setDriverOfferHistoryPage(1);
  }, [driverOfferHistoryTab]);

  useEffect(() => {
    setNotificationPage(1);
    setNotificationActionError('');
    setNotificationActionMessage('');
  }, [notificationTab]);

  useEffect(() => {
    setTripPage((prev) => Math.min(prev, tripTotalPages));
  }, [tripTotalPages]);

  useEffect(() => {
    setJoinRequestHistoryPage((prev) => Math.min(prev, joinRequestHistoryTotalPages));
  }, [joinRequestHistoryTotalPages]);

  useEffect(() => {
    setRequestHistoryPage((prev) => Math.min(prev, requestHistoryTotalPages));
  }, [requestHistoryTotalPages]);

  useEffect(() => {
    setDriverOfferHistoryPage((prev) => Math.min(prev, driverOfferHistoryTotalPages));
  }, [driverOfferHistoryTotalPages]);

  useEffect(() => {
    setNotificationPage((prev) => Math.min(prev, notificationTotalPages));
  }, [notificationTotalPages]);

  useEffect(() => {
    if (loading || error) {
      return;
    }
    if (location.state?.focus === 'REQUEST_HISTORY' && role === 'RIDER') {
      setRequestHistoryTab('ALL');
      setRequestHistoryPage(1);
      window.setTimeout(() => {
        requestHistoryAnchorRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 120);
    }
  }, [error, loading, location.state, role]);

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

  async function handleMarkNotificationRead(notificationId) {
    if (!userId || notificationId == null) {
      return;
    }
    setNotificationActionError('');
    setNotificationActionMessage('');
    setMarkingNotificationId(notificationId);
    try {
      const updated = await markNotificationRead(userId, notificationId);
      setNotifications((prev) => prev.map((item) => (
        item.notificationId === notificationId
          ? {
              ...item,
              read: updated.read,
            }
          : item
      )));
      setNotificationActionMessage(`Notification #${notificationId} marked as read.`);
    } catch (markError) {
      setNotificationActionError(markError.message || 'Unable to mark notification as read.');
    } finally {
      setMarkingNotificationId(null);
    }
  }

  async function handleMarkAllNotificationsRead() {
    if (!userId) {
      return;
    }
    setNotificationActionError('');
    setNotificationActionMessage('');
    setMarkingAllNotifications(true);
    try {
      const response = await markAllNotificationsRead(userId);
      setNotifications((prev) => prev.map((item) => ({
        ...item,
        read: true,
      })));
      setNotificationActionMessage(`Marked ${response.updatedCount || 0} notification(s) as read.`);
    } catch (markError) {
      setNotificationActionError(markError.message || 'Unable to mark all notifications as read.');
    } finally {
      setMarkingAllNotifications(false);
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

      {arrivalMessage ? (
        <p className="status-note">{arrivalMessage}</p>
      ) : null}

      <SectionCard title="Trip Confirmations & Notifications">
        <div className="section-subtabs">
          <div className="subtabs-chip-row">
            <button
              className={`story-chip ${notificationTab === 'UNREAD' ? 'active' : ''}`}
              type="button"
              onClick={() => setNotificationTab('UNREAD')}
            >
              Unread
            </button>
            <button
              className={`story-chip ${notificationTab === 'ALL' ? 'active' : ''}`}
              type="button"
              onClick={() => setNotificationTab('ALL')}
            >
              All
            </button>
          </div>
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleMarkAllNotificationsRead}
              disabled={markingAllNotifications || notifications.length === 0}
            >
              {markingAllNotifications ? 'Marking...' : 'Mark All Read'}
            </button>
          </div>
        </div>
        {notificationActionError ? <p className="status-error">{notificationActionError}</p> : null}
        {notificationActionMessage ? <p>{notificationActionMessage}</p> : null}
        {filteredNotifications.length === 0 ? (
          <p>No notifications in this tab.</p>
        ) : (
          <>
            <div className="results-grid">
              {pagedNotifications.map((item) => (
                <article key={item.notificationId} className="result-card">
                  <p><strong>Title:</strong> {item.title}</p>
                  <p><strong>Type:</strong> {item.type}</p>
                  <p><strong>Message:</strong> {item.message}</p>
                  <p><strong>Created at:</strong> {item.createdAt}</p>
                  {item.relatedRideMatchId ? (
                    <p><strong>Related match:</strong> #{item.relatedRideMatchId}</p>
                  ) : null}
                  <p><strong>Status:</strong> {item.read ? 'Read' : 'Unread'}</p>
                  {!item.read ? (
                    <div className="form-actions">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => handleMarkNotificationRead(item.notificationId)}
                        disabled={markingNotificationId === item.notificationId}
                      >
                        {markingNotificationId === item.notificationId ? 'Updating...' : 'Mark as Read'}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
            <Pager
              page={notificationPage}
              totalPages={notificationTotalPages}
              totalItems={filteredNotifications.length}
              onPageChange={(nextPage) => setNotificationPage(nextPage)}
            />
          </>
        )}
      </SectionCard>

      <SectionCard title="Trip Filter">
        <div className="section-subtabs">
          <p className="subtabs-label">Trip time category</p>
          <div className="subtabs-row">
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
          <p className="subtabs-label">Trip type view</p>
          <div className="subtabs-chip-row">
            <button
              className={`story-chip ${tripTypeFilter === 'ALL' ? 'active' : ''}`}
              type="button"
              onClick={() => setTripTypeFilter('ALL')}
            >
              All Types
            </button>
            <button
              className={`story-chip ${tripTypeFilter === 'JOIN_REQUEST' ? 'active' : ''}`}
              type="button"
              onClick={() => setTripTypeFilter('JOIN_REQUEST')}
            >
              Join Request
            </button>
            <button
              className={`story-chip ${tripTypeFilter === 'ONE_OFF_REQUEST' ? 'active' : ''}`}
              type="button"
              onClick={() => setTripTypeFilter('ONE_OFF_REQUEST')}
            >
              One-Off Request
            </button>
          </div>
          <p className="status-note">
            Showing {typeFilteredTrips.length} trip(s) with this filter combination.
          </p>
        </div>
      </SectionCard>

      {loading ? <p>Loading trips...</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      {!loading && !error && trips.length === 0 && !hasAuxHistory ? (
        <SectionCard title="No Trips Yet">
          <div className="section-subtabs">
            <div className="subtabs-chip-row">
              <button
                className={`story-chip ${noTripTab === 'GUIDE' ? 'active' : ''}`}
                type="button"
                onClick={() => setNoTripTab('GUIDE')}
              >
                Getting Started
              </button>
              <button
                className={`story-chip ${noTripTab === 'RIDER' ? 'active' : ''}`}
                type="button"
                onClick={() => setNoTripTab('RIDER')}
              >
                Rider Actions
              </button>
              <button
                className={`story-chip ${noTripTab === 'DRIVER' ? 'active' : ''}`}
                type="button"
                onClick={() => setNoTripTab('DRIVER')}
              >
                Driver Actions
              </button>
            </div>
            {noTripTab === 'GUIDE' ? (
              <div className="status-note">
                <p>You have no confirmed trips at the moment.</p>
                <p>Use Rider or Driver actions to create your first matched trip.</p>
              </div>
            ) : null}
            {noTripTab === 'RIDER' ? (
              <div className="form-actions">
                <Link className="btn" to="/">Find a Ride</Link>
                <Link className="btn btn-secondary" to="/post-ride-request">Post One-Off Request</Link>
              </div>
            ) : null}
            {noTripTab === 'DRIVER' ? (
              <div className="form-actions">
                <Link className="btn" to="/driver-hub">Open Driver Hub</Link>
                <Link className="btn btn-secondary" to="/profile">Update Profile Trust Info</Link>
              </div>
            ) : null}
          </div>
        </SectionCard>
      ) : null}

      {!loading && !error && trips.length === 0 && hasAuxHistory ? (
        <SectionCard title="No Confirmed Trips Yet">
          <p>
            You currently have request or offer history records, but no confirmed trip match yet.
          </p>
          <p>
            Confirmed trips will appear here after a request/offer is accepted and matched.
          </p>
        </SectionCard>
      ) : null}

      {!loading && !error && trips.length > 0 && typeFilteredTrips.length === 0 ? (
        <SectionCard title="No Trips In This Filter">
          <p>No trips match the selected filter and secondary tab right now.</p>
          {tripFilter === 'UPCOMING' && hasHistoryTrips ? (
            <div className="form-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setTripFilter('HISTORY')}
              >
                View History Trips
              </button>
            </div>
          ) : null}
          {tripFilter === 'HISTORY' && hasUpcomingTrips ? (
            <div className="form-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setTripFilter('UPCOMING')}
              >
                View Upcoming Trips
              </button>
            </div>
          ) : null}
        </SectionCard>
      ) : null}

      {!loading && !error && pagedTrips.length > 0 ? (
        <SectionCard title="Trip Results">
          <div className="results-grid">
            {pagedTrips.map((trip) => {
              const tripKey = resolveTripKey(trip);
              const form = getRatingFormState(tripKey);
              const isHistoryTrip = !isUpcomingTrip(trip);
              const canRate = isHistoryTrip && trip.tripStatus === 'CONFIRMED';
              const { targetUserId, targetName } = resolveRatingTarget(trip, role);

              return (
                <article key={tripKey} className="result-card">
                  <p><strong>Match ID:</strong> {trip.rideMatchId}</p>
                  <p><strong>Type:</strong> {toTripTypeLabel(trip.tripType)}</p>
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
          </div>
          <Pager
            page={tripPage}
            totalPages={tripTotalPages}
            totalItems={typeFilteredTrips.length}
            onPageChange={(nextPage) => setTripPage(nextPage)}
          />
        </SectionCard>
      ) : null}

      {!loading && !error && role === 'RIDER' ? (
        <SectionCard title="My Join Request History">
          <div className="section-subtabs">
            <div className="subtabs-chip-row">
              <button
                className={`story-chip ${joinRequestHistoryTab === 'PENDING' ? 'active' : ''}`}
                type="button"
                onClick={() => setJoinRequestHistoryTab('PENDING')}
              >
                Pending
              </button>
              <button
                className={`story-chip ${joinRequestHistoryTab === 'ACCEPTED' ? 'active' : ''}`}
                type="button"
                onClick={() => setJoinRequestHistoryTab('ACCEPTED')}
              >
                Accepted
              </button>
              <button
                className={`story-chip ${joinRequestHistoryTab === 'REJECTED' ? 'active' : ''}`}
                type="button"
                onClick={() => setJoinRequestHistoryTab('REJECTED')}
              >
                Rejected
              </button>
              <button
                className={`story-chip ${joinRequestHistoryTab === 'ALL' ? 'active' : ''}`}
                type="button"
                onClick={() => setJoinRequestHistoryTab('ALL')}
              >
                All
              </button>
            </div>
          </div>
          {filteredJoinRequestHistory.length === 0 ? (
            <p>No join requests found in this secondary tab.</p>
          ) : (
            <>
              <div className="results-grid">
                {pagedJoinRequestHistory.map((request) => (
                  <article key={request.joinRequestId} className="result-card">
                    <p><strong>Join request ID:</strong> {request.joinRequestId}</p>
                    <p><strong>Ride offer ID:</strong> {request.rideOfferId}</p>
                    <p><strong>Driver:</strong> {request.driverName}</p>
                    <p><strong>Route:</strong> {(request.originAddress || request.origin)} to {(request.destinationAddress || request.destination)}</p>
                    <p><strong>Trip:</strong> {request.departureDate} {request.departureTime}</p>
                    <p><strong>Requested seats:</strong> {request.requestedSeats}</p>
                    <p><strong>Status:</strong> {request.status}</p>
                    <p><strong>Submitted at:</strong> {request.requestDateTime}</p>
                    {request.rideMatchId ? (
                      <p><strong>Ride match:</strong> #{request.rideMatchId} ({request.rideMatchStatus || 'CONFIRMED'})</p>
                    ) : null}
                    {request.meetingPoint ? (
                      <p><strong>Meeting point:</strong> {request.meetingPoint}</p>
                    ) : null}
                    {request.status === 'PENDING' ? (
                      <p className="status-note">Waiting for driver decision.</p>
                    ) : null}
                    {request.status === 'REJECTED' ? (
                      <p className="status-note">Rejected by driver. You can submit another request from Find a Ride.</p>
                    ) : null}
                    {request.status === 'ACCEPTED' ? (
                      <p className="status-note">After the trip time passes, go to Trip Results, open History, then submit your review.</p>
                    ) : null}
                  </article>
                ))}
              </div>
              <Pager
                page={joinRequestHistoryPage}
                totalPages={joinRequestHistoryTotalPages}
                totalItems={filteredJoinRequestHistory.length}
                onPageChange={(nextPage) => setJoinRequestHistoryPage(nextPage)}
              />
            </>
          )}
        </SectionCard>
      ) : null}

      {!loading && !error && role === 'RIDER' ? (
        <div ref={requestHistoryAnchorRef}>
          <SectionCard title="My One-Off Request History">
          {requestActionError ? <p className="status-error">{requestActionError}</p> : null}
          {requestActionMessage ? <p>{requestActionMessage}</p> : null}
          <div className="section-subtabs">
            <div className="subtabs-chip-row">
              <button
                className={`story-chip ${requestHistoryTab === 'ALL' ? 'active' : ''}`}
                type="button"
                onClick={() => setRequestHistoryTab('ALL')}
              >
                All
              </button>
              <button
                className={`story-chip ${requestHistoryTab === 'OPEN' ? 'active' : ''}`}
                type="button"
                onClick={() => setRequestHistoryTab('OPEN')}
              >
                Open
              </button>
              <button
                className={`story-chip ${requestHistoryTab === 'MATCHED' ? 'active' : ''}`}
                type="button"
                onClick={() => setRequestHistoryTab('MATCHED')}
              >
                Matched
              </button>
              <button
                className={`story-chip ${requestHistoryTab === 'CLOSED' ? 'active' : ''}`}
                type="button"
                onClick={() => setRequestHistoryTab('CLOSED')}
              >
                Closed
              </button>
            </div>
          </div>
          {filteredRequestHistory.length === 0 ? (
            <p>No one-off requests found in this secondary tab.</p>
          ) : (
            <>
              <div className="results-grid">
                {pagedRequestHistory.map((request) => (
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
              <Pager
                page={requestHistoryPage}
                totalPages={requestHistoryTotalPages}
                totalItems={filteredRequestHistory.length}
                onPageChange={(nextPage) => setRequestHistoryPage(nextPage)}
              />
            </>
          )}
          </SectionCard>
        </div>
      ) : null}

      {!loading && !error && role === 'DRIVER' ? (
        <SectionCard title="My One-Off Offer History">
          <div className="section-subtabs">
            <div className="subtabs-chip-row">
              <button
                className={`story-chip ${driverOfferHistoryTab === 'ALL' ? 'active' : ''}`}
                type="button"
                onClick={() => setDriverOfferHistoryTab('ALL')}
              >
                All
              </button>
              <button
                className={`story-chip ${driverOfferHistoryTab === 'PENDING' ? 'active' : ''}`}
                type="button"
                onClick={() => setDriverOfferHistoryTab('PENDING')}
              >
                Pending
              </button>
              <button
                className={`story-chip ${driverOfferHistoryTab === 'ACCEPTED' ? 'active' : ''}`}
                type="button"
                onClick={() => setDriverOfferHistoryTab('ACCEPTED')}
              >
                Accepted
              </button>
              <button
                className={`story-chip ${driverOfferHistoryTab === 'REJECTED' ? 'active' : ''}`}
                type="button"
                onClick={() => setDriverOfferHistoryTab('REJECTED')}
              >
                Rejected
              </button>
            </div>
          </div>
          {filteredDriverOfferHistory.length === 0 ? (
            <p>No one-off offers found in this secondary tab.</p>
          ) : (
            <>
              <div className="results-grid">
                {pagedDriverOfferHistory.map((offer) => (
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
              <Pager
                page={driverOfferHistoryPage}
                totalPages={driverOfferHistoryTotalPages}
                totalItems={filteredDriverOfferHistory.length}
                onPageChange={(nextPage) => setDriverOfferHistoryPage(nextPage)}
              />
            </>
          )}
        </SectionCard>
      ) : null}
    </div>
  );
}

export default MyTripsPage;

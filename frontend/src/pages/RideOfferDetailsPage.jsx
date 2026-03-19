import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getRideOfferDetail, submitJoinRequest } from '../api/rideOffersApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import SectionCard from '../components/SectionCard.jsx';

function RideOfferDetailsPage() {
  const { userId, role } = useAuth();
  const { offerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestedSeats, setRequestedSeats] = useState(1);
  const [requestError, setRequestError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!offerId) {
      setLoading(false);
      setError('Ride offer id is missing.');
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    getRideOfferDetail(offerId)
      .then((data) => {
        if (active) {
          setDetail(data);
          setRequestedSeats(1);
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load ride offer details.');
          setDetail(null);
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
  }, [offerId]);

  const backToResultsPath = `/search-results${location.search || ''}`;
  const maxSeats = detail?.availableSeats || 1;

  async function handleRequestSubmit(event) {
    event.preventDefault();
    if (!detail) {
      return;
    }

    setRequestError('');
    if (role !== 'RIDER') {
      setRequestError('Only rider accounts can request to join rides.');
      return;
    }

    const seats = Number(requestedSeats);
    if (!Number.isInteger(seats) || seats < 1) {
      setRequestError('Please enter a valid seat count (minimum 1).');
      return;
    }
    if (seats > detail.availableSeats) {
      setRequestError(`Only ${detail.availableSeats} seat(s) are currently available for this ride.`);
      return;
    }

    setSubmitting(true);
    try {
      const joinRequest = await submitJoinRequest({
        riderId: userId,
        rideOfferId: Number(detail.offerId),
        requestedSeats: seats,
      });

      navigate('/ride-confirmed', {
        state: {
          joinRequest,
          offerDetail: detail,
          requestedSeats: seats,
        },
      });
    } catch (submitError) {
      setRequestError(submitError.message || 'Unable to submit join request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <header>
        <h2>Ride Offer Details</h2>
        <p>Review trip details and trust information before requesting.</p>
      </header>

      {loading ? <p>Loading ride offer details...</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      {!loading && !error && detail ? (
      <div className="two-column">
        <SectionCard title="Driver Profile">
          <p><strong>Name:</strong> {detail.driver?.driverName}</p>
          <p>
            <strong>Rating:</strong>{' '}
            {detail.driver?.averageRating != null
              ? `${Number(detail.driver.averageRating).toFixed(1)} (${detail.driver.ratingCount || 0} ratings)`
              : 'No ratings yet'}
          </p>
          <p><strong>Preferences:</strong> {detail.driver?.travelPreferences || 'Not provided'}</p>
          <p><strong>Notes:</strong> {detail.driver?.trustNotes || 'Not provided'}</p>
          <p><strong>Bio:</strong> {detail.driver?.bio || 'Not provided'}</p>
        </SectionCard>

        <SectionCard title="Trip Information">
          <p><strong>Origin:</strong> {detail.origin}</p>
          <p><strong>Destination:</strong> {detail.destination}</p>
          <p><strong>Date:</strong> {detail.departureDate}</p>
          <p><strong>Departure:</strong> {detail.departureTime}</p>
          <p><strong>Available seats:</strong> {detail.availableSeats}</p>
          <p><strong>Status:</strong> {detail.status}</p>
        </SectionCard>
      </div>
      ) : null}

      <SectionCard title="Before You Continue">
        <p>Your request will be reviewed by the driver.</p>
        <p>The system checks seat availability before sending the request.</p>
        <form className="form-grid compact-form" onSubmit={handleRequestSubmit}>
          <label>
            Requested seat count
            <input
              type="number"
              min="1"
              max={maxSeats}
              value={requestedSeats}
              onChange={(event) => setRequestedSeats(event.target.value)}
              disabled={!detail || submitting}
            />
          </label>
          {requestError ? <p className="status-error">{requestError}</p> : null}
          <div className="form-actions">
            <button
              className="btn"
              type="submit"
              disabled={!detail || submitting || detail.availableSeats < 1}
            >
              {submitting ? 'Submitting...' : 'Request This Ride'}
            </button>
            <Link className="btn btn-secondary" to={backToResultsPath}>Back to Results</Link>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

export default RideOfferDetailsPage;

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { acceptRideRequestOffer, getRideRequestOffersForRider } from '../api/rideOffersApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import SectionCard from '../components/SectionCard.jsx';

function RideRequestOffersPage() {
  const { userId, role } = useAuth();
  const { rideRequestId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [submittingOfferId, setSubmittingOfferId] = useState(null);

  const riderId = useMemo(() => {
    if (role === 'RIDER' && userId) {
      return userId;
    }
    const value = Number(searchParams.get('riderId'));
    return Number.isInteger(value) && value > 0 ? value : null;
  }, [role, searchParams, userId]);

  useEffect(() => {
    if (!rideRequestId) {
      setLoading(false);
      setError('Ride request id is missing.');
      return;
    }
    if (!riderId) {
      setLoading(false);
      setError('Rider account context is missing.');
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    getRideRequestOffersForRider(riderId, rideRequestId)
      .then((data) => {
        if (active) {
          setOffers(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load driver offers for this request.');
          setOffers([]);
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
  }, [rideRequestId, riderId]);

  async function handleAccept(offer) {
    if (!rideRequestId) {
      return;
    }
    if (!riderId) {
      setActionError('Rider account context is missing. Please sign in again.');
      return;
    }
    if (offer.status !== 'PENDING') {
      setActionError('Only pending offers can be accepted.');
      return;
    }

    setActionError('');
    setSubmittingOfferId(offer.offerId);

    try {
      const acceptedOneOff = await acceptRideRequestOffer(riderId, rideRequestId, offer.offerId);
      navigate('/ride-confirmed', {
        state: {
          acceptedOneOff,
          selectedOneOffOffer: offer,
        },
      });
    } catch (acceptError) {
      setActionError(acceptError.message || 'Unable to accept this offer.');
    } finally {
      setSubmittingOfferId(null);
    }
  }

  return (
    <div className="page-stack">
      <header>
        <h2>Driver Offers for Your Request</h2>
        <p>Review responses and accept one final offer.</p>
      </header>

      <SectionCard title="Request Overview">
        <p><strong>Ride request ID:</strong> {rideRequestId}</p>
        <p><strong>Rider ID:</strong> {riderId}</p>
      </SectionCard>

      {loading ? <p>Loading offers...</p> : null}
      {error ? <p className="status-error">{error}</p> : null}
      {actionError ? <p className="status-error">{actionError}</p> : null}

      {!loading && !error && offers.length === 0 ? (
        <SectionCard title="No Offers Yet">
          <p>No driver responses have arrived yet for this one-off request.</p>
          <p>You can check back shortly.</p>
        </SectionCard>
      ) : null}

      {!loading && !error && offers.length > 0 ? (
        <SectionCard title="Available Driver Offers">
          {!offers.some((offer) => offer.status === 'PENDING') ? (
            <p>No pending offers are available to accept. This request may already be matched.</p>
          ) : null}
          <div className="results-grid">
            {offers.map((offer) => (
              <article key={offer.offerId} className="result-card">
                <p><strong>Offer ID:</strong> {offer.offerId}</p>
                <p><strong>Driver:</strong> {offer.driverName}</p>
                <p><strong>Proposed seats:</strong> {offer.proposedSeats}</p>
                <p><strong>Meeting point:</strong> {offer.meetingPoint || 'Not provided'}</p>
                <p><strong>Status:</strong> {offer.status}</p>
                <p><strong>Submitted:</strong> {offer.createdAt}</p>
                <div className="form-actions">
                  {offer.status === 'PENDING' ? (
                    <button
                      className="btn"
                      type="button"
                      onClick={() => handleAccept(offer)}
                      disabled={submittingOfferId === offer.offerId}
                    >
                      {submittingOfferId === offer.offerId ? 'Accepting...' : 'Accept This Offer'}
                    </button>
                  ) : (
                    <button className="btn btn-secondary" type="button" disabled>
                      {offer.status === 'ACCEPTED' ? 'Already Accepted' : 'Not Acceptable'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <div className="form-actions">
        <Link className="btn btn-secondary" to="/post-ride-request">Post Another Request</Link>
        <Link className="btn" to="/">Return Home</Link>
      </div>
    </div>
  );
}

export default RideRequestOffersPage;

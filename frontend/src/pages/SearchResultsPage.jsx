import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchRideOffers } from '../api/rideOffersApi.js';
import RideOfferCard from '../components/RideOfferCard.jsx';
import SectionCard from '../components/SectionCard.jsx';

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = useMemo(() => ({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    departureDate: searchParams.get('departureDate') || '',
    departureTime: searchParams.get('departureTime') || '',
    passengerCount: searchParams.get('passengerCount') || '',
  }), [searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    searchRideOffers(filters)
      .then((data) => {
        if (active) {
          setOffers(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load ride offers right now.');
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
  }, [filters]);

  return (
    <div className="page-stack">
      <header>
        <h2>Search Results</h2>
        <p>Matching Ride Offers</p>
      </header>

      <SectionCard title="Search Summary">
        <p><strong>From:</strong> {filters.origin || 'Any'}</p>
        <p><strong>To:</strong> {filters.destination || 'Any'}</p>
        <p><strong>Date:</strong> {filters.departureDate || 'Any'}</p>
        <p><strong>Time:</strong> {filters.departureTime || 'Any'}</p>
        <p><strong>Passengers:</strong> {filters.passengerCount || 'Any'}</p>
      </SectionCard>

      {loading ? <p>Loading matching ride offers...</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      {!loading && !error && offers.length === 0 ? (
        <SectionCard title="No Results">
          <p>No suitable ride offers found.</p>
          <Link className="btn btn-secondary" to="/post-ride-request">
            Post a One-Off Ride Request
          </Link>
        </SectionCard>
      ) : null}

      {!loading && !error && offers.length > 0 ? (
        <section className="results-grid">
          {offers.map((offer) => (
            <RideOfferCard
              key={offer.offerId}
              offer={offer}
              queryString={searchParams.toString()}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}

export default SearchResultsPage;

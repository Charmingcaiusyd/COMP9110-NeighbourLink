import { Link } from 'react-router-dom';

function RideOfferCard({ offer, queryString }) {
  const ratingSummary = offer.driver?.averageRating != null
    ? `${Number(offer.driver.averageRating).toFixed(1)} (${offer.driver.ratingCount || 0} ratings)`
    : 'No ratings yet';

  const detailPath = `/ride-offer-details/${offer.offerId}${queryString ? `?${queryString}` : ''}`;

  return (
    <article className="result-card">
      <p><strong>Driver:</strong> {offer.driver?.driverName}</p>
      <p><strong>Rating:</strong> {ratingSummary}</p>
      <p><strong>Route:</strong> {offer.origin} to {offer.destination}</p>
      <p><strong>Departure:</strong> {offer.departureDate} {offer.departureTime}</p>
      <p><strong>Available seats:</strong> {offer.availableSeats}</p>
      <Link className="btn btn-secondary" to={detailPath}>
        View Details
      </Link>
    </article>
  );
}

export default RideOfferCard;

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import SectionCard from '../components/SectionCard.jsx';

function RideConfirmedPage() {
  const { userId, session } = useAuth();
  const { state } = useLocation();
  const joinRequest = state?.joinRequest;
  const offerDetail = state?.offerDetail;
  const seatsRequested = state?.requestedSeats;
  const oneOffRideRequest = state?.oneOffRideRequest;
  const oneOffInput = state?.oneOffInput;
  const acceptedOneOff = state?.acceptedOneOff;
  const selectedOneOffOffer = state?.selectedOneOffOffer;
  const hasSubmittedRequest = Boolean(joinRequest && offerDetail);
  const hasPostedOneOffRequest = Boolean(oneOffRideRequest && oneOffInput);
  const hasAcceptedOneOffOffer = Boolean(acceptedOneOff && selectedOneOffOffer);

  return (
    <div className="page-stack">
      <header>
        <h2>
          {hasAcceptedOneOffOffer
            ? 'One-Off Ride Matched'
            : hasPostedOneOffRequest
            ? 'One-Off Request Submitted'
            : hasSubmittedRequest
              ? 'Ride Request Submitted'
              : 'Ride Confirmed'}
        </h2>
        <p>
          {hasAcceptedOneOffOffer
            ? 'You accepted a driver offer. Your one-off trip is now confirmed.'
            : hasPostedOneOffRequest
            ? 'Your one-off ride request is now open for driver responses.'
            : hasSubmittedRequest
              ? 'Your join request has been sent to the driver for review.'
              : 'Your ride arrangement has been confirmed.'}
        </p>
      </header>

      <SectionCard title="Trip Summary">
        {hasAcceptedOneOffOffer ? (
          <>
            <p><strong>Ride request ID:</strong> {acceptedOneOff.rideRequestId}</p>
            <p><strong>Accepted offer ID:</strong> {acceptedOneOff.acceptedOfferId}</p>
            <p><strong>Ride match ID:</strong> {acceptedOneOff.rideMatchId}</p>
            <p><strong>Driver:</strong> {selectedOneOffOffer.driverName}</p>
            <p><strong>Proposed seats:</strong> {selectedOneOffOffer.proposedSeats}</p>
            <p><strong>Meeting point:</strong> {selectedOneOffOffer.meetingPoint || 'Not provided'}</p>
            <p><strong>Request status:</strong> {acceptedOneOff.rideRequestStatus}</p>
          </>
        ) : hasPostedOneOffRequest ? (
          <>
            <p><strong>Rider:</strong> {session?.fullName || `Rider #${userId}`}</p>
            <p><strong>Route:</strong> {oneOffInput.origin} to {oneOffInput.destination}</p>
            <p><strong>Date and time:</strong> {oneOffInput.tripDate} {oneOffInput.tripTime}</p>
            <p><strong>Passengers:</strong> {oneOffInput.passengerCount}</p>
            <p><strong>Request ID:</strong> {oneOffRideRequest.rideRequestId}</p>
            <p><strong>Request status:</strong> {oneOffRideRequest.status}</p>
          </>
        ) : hasSubmittedRequest ? (
          <>
            <p><strong>Driver:</strong> {offerDetail.driver?.driverName}</p>
            <p><strong>Rider:</strong> {session?.fullName || `Rider #${userId}`}</p>
            <p><strong>Route:</strong> {offerDetail.origin} to {offerDetail.destination}</p>
            <p><strong>Date and time:</strong> {offerDetail.departureDate} {offerDetail.departureTime}</p>
            <p><strong>Requested seats:</strong> {seatsRequested}</p>
            <p><strong>Request ID:</strong> {joinRequest.joinRequestId}</p>
            <p><strong>Request status:</strong> {joinRequest.status}</p>
          </>
        ) : (
          <>
            <p><strong>Driver:</strong> Emma Lee</p>
            <p><strong>Rider:</strong> Daniel Chen</p>
            <p><strong>Route:</strong> Clayton to City Centre</p>
            <p><strong>Date and time:</strong> 2026-03-18 08:30</p>
            <p><strong>Seats booked:</strong> 1</p>
            <p><strong>Meeting point:</strong> Clayton Station Gate 2</p>
          </>
        )}
      </SectionCard>

      <SectionCard title="Next Steps">
        {hasAcceptedOneOffOffer ? (
          <>
            <p>Your one-off ride request is now closed to new accepted matches.</p>
            <p>You can return home or post another request if needed.</p>
          </>
        ) : hasPostedOneOffRequest ? (
          <>
            <p>Drivers can now respond to this request with a simple offer.</p>
            <p>You can review and accept one driver offer in the next flow step.</p>
            <div className="form-actions">
              <Link
                className="btn"
                to={`/ride-requests/${oneOffRideRequest.rideRequestId}/offers?riderId=${userId}`}
              >
                Review Driver Offers
              </Link>
            </div>
          </>
        ) : hasSubmittedRequest ? (
          <>
            <p>The driver will accept or reject this request in their dashboard.</p>
            <p>You can return to search for other offers while waiting.</p>
          </>
        ) : (
          <>
            <p>Contact details are available after confirmation.</p>
            <p>You can review this trip later in My Trips.</p>
          </>
        )}
        <div className="form-actions">
          <Link className="btn btn-secondary" to="/post-ride-request">Post Another Request</Link>
          <Link className="btn" to="/">Return to Home</Link>
        </div>
      </SectionCard>
    </div>
  );
}

export default RideConfirmedPage;

import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from 'react-leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { getRouteOverview } from '../api/rideOffersApi.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function TripRouteMap({ trip }) {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasCoordinates = Number.isFinite(trip?.originLatitude)
    && Number.isFinite(trip?.originLongitude)
    && Number.isFinite(trip?.destinationLatitude)
    && Number.isFinite(trip?.destinationLongitude);

  useEffect(() => {
    if (!hasCoordinates) {
      setRoute(null);
      setError('');
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    getRouteOverview(
      trip.originLatitude,
      trip.originLongitude,
      trip.destinationLatitude,
      trip.destinationLongitude,
    )
      .then((payload) => {
        if (active) {
          setRoute(payload);
        }
      })
      .catch((routeError) => {
        if (active) {
          setError(routeError.message || 'Unable to load route overview.');
          setRoute({
            distanceMeters: null,
            durationSeconds: null,
            path: [
              {
                latitude: trip.originLatitude,
                longitude: trip.originLongitude,
              },
              {
                latitude: trip.destinationLatitude,
                longitude: trip.destinationLongitude,
              },
            ],
          });
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
  }, [
    hasCoordinates,
    trip?.originLatitude,
    trip?.originLongitude,
    trip?.destinationLatitude,
    trip?.destinationLongitude,
  ]);

  const path = useMemo(() => {
    if (!route || !Array.isArray(route.path)) {
      return [];
    }
    return route.path
      .filter((point) => Number.isFinite(point?.latitude) && Number.isFinite(point?.longitude))
      .map((point) => [point.latitude, point.longitude]);
  }, [route]);

  if (!hasCoordinates) {
    return (
      <p className="trip-map-note">
        Map preview is unavailable because this trip has no saved coordinates yet.
      </p>
    );
  }

  return (
    <div className="trip-route-map">
      {loading ? <p>Loading route map...</p> : null}
      {error ? <p className="status-error">{error}</p> : null}
      <div className="trip-route-summary">
        <span>
          <strong>Start:</strong> {trip.originAddress || trip.origin}
        </span>
        <span>
          <strong>End:</strong> {trip.destinationAddress || trip.destination}
        </span>
        {route?.distanceMeters ? (
          <span><strong>Distance:</strong> {(route.distanceMeters / 1000).toFixed(1)} km</span>
        ) : null}
        {route?.durationSeconds ? (
          <span><strong>Estimated duration:</strong> {Math.round(route.durationSeconds / 60)} min</span>
        ) : null}
      </div>
      <MapContainer
        center={[trip.originLatitude, trip.originLongitude]}
        zoom={12}
        scrollWheelZoom
        className="trip-map-canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[trip.originLatitude, trip.originLongitude]}>
          <Popup>Start: {trip.originAddress || trip.origin}</Popup>
        </Marker>
        <Marker position={[trip.destinationLatitude, trip.destinationLongitude]}>
          <Popup>End: {trip.destinationAddress || trip.destination}</Popup>
        </Marker>
        {path.length > 1 ? <Polyline positions={path} color="#0f766e" weight={4} /> : null}
      </MapContainer>
    </div>
  );
}

export default TripRouteMap;

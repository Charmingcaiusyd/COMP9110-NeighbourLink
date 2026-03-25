import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function normalizeCoordinate(value) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function OneOffMeetingPointMap({
  originLatitude,
  originLongitude,
  originLabel,
  originAddress,
}) {
  const latitude = normalizeCoordinate(originLatitude);
  const longitude = normalizeCoordinate(originLongitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

  if (!hasCoordinates) {
    return (
      <p className="trip-map-note">
        Map preview is unavailable because this request has no saved origin coordinates.
      </p>
    );
  }

  const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const popupLabel = originAddress || originLabel || 'Rider origin';

  return (
    <div className="one-off-map-preview">
      <div className="one-off-map-shell">
        <MapContainer
          center={[latitude, longitude]}
          zoom={14}
          scrollWheelZoom
          className="one-off-map-canvas"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]}>
            <Popup>{popupLabel}</Popup>
          </Marker>
        </MapContainer>
      </div>
      <a className="one-off-map-link" href={mapsLink} target="_blank" rel="noreferrer">
        Open this point in Google Maps
      </a>
    </div>
  );
}

export default OneOffMeetingPointMap;

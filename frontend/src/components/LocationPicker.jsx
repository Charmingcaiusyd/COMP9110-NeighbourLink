import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  reverseLookupAustralia,
  searchAustralianLocations,
} from '../api/rideOffersApi.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [-33.8688, 151.2093];

function MapClickCapture({ disabled, onPick }) {
  useMapEvents({
    async click(event) {
      if (disabled) {
        return;
      }
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function MapAutoFocus({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      map.setView([latitude, longitude], 15);
    }
  }, [latitude, longitude, map]);
  return null;
}

function normalizeLocationPayload(location) {
  if (!location) {
    return null;
  }
  return {
    source: location.source || null,
    displayName: location.displayName || location.address || null,
    address: location.address || null,
    state: location.state || null,
    suburb: location.suburb || null,
    postcode: location.postcode || null,
    latitude: Number.isFinite(Number(location.latitude)) ? Number(location.latitude) : null,
    longitude: Number.isFinite(Number(location.longitude)) ? Number(location.longitude) : null,
  };
}

function LocationPicker({
  title,
  value,
  onChange,
  disabled = false,
  placeholder = 'Search Australian suburb, postcode, or address',
}) {
  const normalizedValue = normalizeLocationPayload(value);
  const [query, setQuery] = useState(
    normalizedValue?.displayName || normalizedValue?.address || '',
  );
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapPicking, setMapPicking] = useState(false);

  useEffect(() => {
    const nextText = normalizedValue?.displayName || normalizedValue?.address || '';
    setQuery(nextText);
  }, [normalizedValue?.displayName, normalizedValue?.address]);

  const mapCenter = useMemo(() => {
    if (
      Number.isFinite(normalizedValue?.latitude)
      && Number.isFinite(normalizedValue?.longitude)
    ) {
      return [normalizedValue.latitude, normalizedValue.longitude];
    }
    return DEFAULT_CENTER;
  }, [normalizedValue?.latitude, normalizedValue?.longitude]);

  async function handleSearch() {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = await searchAustralianLocations(query.trim(), 8);
      setResults(Array.isArray(payload) ? payload : []);
    } catch (searchError) {
      setError(searchError.message || 'Unable to search locations right now.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function applySelection(location) {
    const normalized = normalizeLocationPayload(location);
    onChange(normalized);
    setResults([]);
    setError('');
  }

  async function handleMapPick(latitude, longitude) {
    setMapPicking(true);
    setError('');
    try {
      const location = await reverseLookupAustralia(latitude, longitude);
      applySelection(location);
    } catch (lookupError) {
      setError(lookupError.message || 'Unable to resolve selected map point.');
    } finally {
      setMapPicking(false);
    }
  }

  function handleManualAddressChange(nextAddress) {
    const updated = {
      ...normalizedValue,
      address: nextAddress,
      displayName: nextAddress || normalizedValue?.displayName || null,
    };
    onChange(updated);
  }

  return (
    <div className="location-picker">
      <p className="location-picker-title">{title}</p>
      <label>
        Search location
        <div className="location-search-row">
          <input
            type="text"
            value={query}
            placeholder={placeholder}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch();
              }
            }}
            disabled={disabled || loading || mapPicking}
          />
          <button
            className="btn btn-secondary"
            type="button"
            onClick={handleSearch}
            disabled={disabled || loading || mapPicking}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </label>

      {results.length > 0 ? (
        <div className="location-results">
          {results.map((item, index) => (
            <button
              type="button"
              key={`${item.displayName || item.address}-${index}`}
              className="location-result-item"
              onClick={() => applySelection(item)}
              disabled={disabled || mapPicking}
            >
              <strong>{item.displayName || item.address || 'Unknown location'}</strong>
              <small>
                {item.suburb || '-'} | {item.state || '-'} | {item.postcode || '-'}
              </small>
            </button>
          ))}
        </div>
      ) : null}

      <label>
        Confirm address text
        <input
          type="text"
          value={normalizedValue?.address || ''}
          placeholder="Exact address or pickup note"
          onChange={(event) => handleManualAddressChange(event.target.value)}
          disabled={disabled || mapPicking}
        />
      </label>

      <div className="location-meta">
        <span><strong>State:</strong> {normalizedValue?.state || '-'}</span>
        <span><strong>Suburb:</strong> {normalizedValue?.suburb || '-'}</span>
        <span><strong>Postcode:</strong> {normalizedValue?.postcode || '-'}</span>
        <span>
          <strong>Coordinates:</strong>{' '}
          {Number.isFinite(normalizedValue?.latitude) && Number.isFinite(normalizedValue?.longitude)
            ? `${normalizedValue.latitude.toFixed(6)}, ${normalizedValue.longitude.toFixed(6)}`
            : 'Not selected'}
        </span>
      </div>

      <div className="location-map-shell">
        <MapContainer
          center={mapCenter}
          zoom={Number.isFinite(normalizedValue?.latitude) ? 15 : 10}
          scrollWheelZoom
          className="location-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickCapture disabled={disabled || mapPicking} onPick={handleMapPick} />
          <MapAutoFocus latitude={normalizedValue?.latitude} longitude={normalizedValue?.longitude} />
          {Number.isFinite(normalizedValue?.latitude) && Number.isFinite(normalizedValue?.longitude) ? (
            <Marker position={[normalizedValue.latitude, normalizedValue.longitude]} />
          ) : null}
        </MapContainer>
      </div>

      {mapPicking ? <p>Resolving selected map point...</p> : null}
      {error ? <p className="status-error">{error}</p> : null}
    </div>
  );
}

export default LocationPicker;

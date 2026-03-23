const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

function resolveErrorMessage(status, backendMessage) {
  if (backendMessage && backendMessage.trim() !== '') {
    return backendMessage;
  }
  if (status === 400) {
    return 'Please check your request input and try again.';
  }
  if (status === 401) {
    return 'Email or password is incorrect.';
  }
  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (status === 404) {
    return 'Requested resource was not found.';
  }
  if (status === 409) {
    return 'Request conflicts with current ride state. Refresh and try again.';
  }
  return 'Something went wrong. Please try again.';
}

async function throwApiError(response) {
  let messageFromBackend = '';
  try {
    const payload = await response.json();
    messageFromBackend = payload?.message || '';
  } catch {
    messageFromBackend = '';
  }

  const error = new Error(resolveErrorMessage(response.status, messageFromBackend));
  error.status = response.status;
  throw error;
}

function buildSearchParams(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      params.set(key, String(value).trim());
    }
  });
  return params;
}

function buildAdminHeaders(adminSessionKey, includeJson = false) {
  const normalizedKey = typeof adminSessionKey === 'string' ? adminSessionKey.trim() : '';
  if (!normalizedKey) {
    throw new Error('Admin session expired. Please sign in again.');
  }
  const headers = {
    'X-Admin-Session': normalizedKey,
  };
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export async function searchRideOffers(filters) {
  const params = buildSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/ride-offers?${params.toString()}`);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getRideOfferDetail(offerId) {
  const response = await fetch(`${API_BASE_URL}/ride-offers/${offerId}`);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function submitJoinRequest(requestBody) {
  const response = await fetch(`${API_BASE_URL}/join-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function createOneOffRideRequest(requestBody) {
  const response = await fetch(`${API_BASE_URL}/ride-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function listOpenRideRequests() {
  const response = await fetch(`${API_BASE_URL}/ride-requests/open`);
  if (!response.ok) {
    await throwApiError(response);
  }
  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((item) => {
    const normalizedRequestId = item?.rideRequestId ?? item?.requestId ?? null;
    return {
      ...item,
      rideRequestId: normalizedRequestId,
      requestId: normalizedRequestId,
    };
  });
}

export async function createRideRequestOffer(rideRequestId, requestBody) {
  const response = await fetch(`${API_BASE_URL}/ride-requests/${rideRequestId}/offers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getPendingJoinRequests(driverId) {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverId}/join-requests/pending`);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function decideJoinRequest(driverId, joinRequestId, requestBody) {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverId}/join-requests/${joinRequestId}/decision`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getRideRequestOffersForRider(riderId, rideRequestId) {
  const response = await fetch(`${API_BASE_URL}/riders/${riderId}/ride-requests/${rideRequestId}/offers`);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function acceptRideRequestOffer(riderId, rideRequestId, offerId) {
  const response = await fetch(
    `${API_BASE_URL}/riders/${riderId}/ride-requests/${rideRequestId}/offers/${offerId}/accept`,
    {
      method: 'PATCH',
    },
  );
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getDriverRideRequestOffers(driverId) {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverId}/ride-request-offers`);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getRiderRideRequests(riderId) {
  const response = await fetch(`${API_BASE_URL}/riders/${riderId}/ride-requests`);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function cancelRideRequest(riderId, rideRequestId) {
  const response = await fetch(`${API_BASE_URL}/riders/${riderId}/ride-requests/${rideRequestId}/cancel`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function login(requestBody) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getAdminOverview(adminSessionKey) {
  const response = await fetch(`${API_BASE_URL}/admin/overview`, {
    headers: buildAdminHeaders(adminSessionKey),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getAdminUsers(adminSessionKey) {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: buildAdminHeaders(adminSessionKey),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function updateAdminUser(adminSessionKey, userId, requestBody) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'PATCH',
    headers: buildAdminHeaders(adminSessionKey, true),
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getAdminRideOffers(adminSessionKey) {
  const response = await fetch(`${API_BASE_URL}/admin/ride-offers`, {
    headers: buildAdminHeaders(adminSessionKey),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getAdminRideRequests(adminSessionKey) {
  const response = await fetch(`${API_BASE_URL}/admin/ride-requests`, {
    headers: buildAdminHeaders(adminSessionKey),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getAdminJoinRequests(adminSessionKey) {
  const response = await fetch(`${API_BASE_URL}/admin/join-requests`, {
    headers: buildAdminHeaders(adminSessionKey),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getAdminRideMatches(adminSessionKey) {
  const response = await fetch(`${API_BASE_URL}/admin/ride-matches`, {
    headers: buildAdminHeaders(adminSessionKey),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function register(requestBody) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function socialLogin(requestBody) {
  const response = await fetch(`${API_BASE_URL}/auth/social-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getProfile(userId) {
  const response = await fetch(`${API_BASE_URL}/profiles/${userId}`);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function updateProfile(userId, requestBody) {
  const response = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getRiderTrips(riderId) {
  const response = await fetch(`${API_BASE_URL}/riders/${riderId}/trips`);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getDriverTrips(driverId) {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverId}/trips`);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function searchAustralianLocations(query, limit = 8) {
  const params = new URLSearchParams();
  if (query && query.trim() !== '') {
    params.set('q', query.trim());
  }
  params.set('limit', String(limit));
  const response = await fetch(`${API_BASE_URL}/locations/au/search?${params.toString()}`);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function reverseLookupAustralia(latitude, longitude) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lng: String(longitude),
  });
  const response = await fetch(`${API_BASE_URL}/locations/au/reverse?${params.toString()}`);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

export async function getRouteOverview(fromLat, fromLng, toLat, toLng) {
  const params = new URLSearchParams({
    fromLat: String(fromLat),
    fromLng: String(fromLng),
    toLat: String(toLat),
    toLng: String(toLng),
  });
  const response = await fetch(`${API_BASE_URL}/routes/overview?${params.toString()}`);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

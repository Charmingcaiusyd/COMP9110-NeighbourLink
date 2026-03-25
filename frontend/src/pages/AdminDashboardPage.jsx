import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  API_BASE_URL,
  getAdminJoinRequests,
  getAdminOverview,
  getAdminRatings,
  getAdminRideMatches,
  getAdminRideOffers,
  getAdminRideRequestOffers,
  getAdminRideRequests,
  getAdminUsers,
  updateAdminJoinRequest,
  updateAdminRating,
  updateAdminRideMatch,
  updateAdminRideOffer,
  updateAdminRideRequestOffer,
  updateAdminRideRequest,
  updateAdminUser,
} from '../api/rideOffersApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import SectionCard from '../components/SectionCard.jsx';

function toEditableUser(user) {
  if (!user) {
    return null;
  }
  return {
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    suburb: user.suburb || '',
    accountStatus: user.accountStatus || 'ACTIVE',
    bio: user.bio || '',
    travelPreferences: user.travelPreferences || '',
    trustNotes: user.trustNotes || '',
    driverLicenceVerifiedStatus: user.driverLicenceVerifiedStatus || 'PENDING',
    driverVehicleInfo: user.driverVehicleInfo || '',
    driverSpareSeatCapacity:
      user.driverSpareSeatCapacity == null ? '' : String(user.driverSpareSeatCapacity),
    driverVerificationNotes: user.driverVerificationNotes || '',
    riderPreferredTravelTimes: user.riderPreferredTravelTimes || '',
    riderUsualDestinations: user.riderUsualDestinations || '',
  };
}

function toEditableRideOffer(offer) {
  return {
    origin: offer.origin || '',
    destination: offer.destination || '',
    departureDate: offer.departureDate || '',
    departureTime: offer.departureTime || '',
    availableSeats: offer.availableSeats == null ? '' : String(offer.availableSeats),
    status: offer.status || 'OPEN',
  };
}

function toEditableRideRequest(request) {
  return {
    origin: request.origin || '',
    destination: request.destination || '',
    tripDate: request.tripDate || '',
    tripTime: request.tripTime || '',
    passengerCount: request.passengerCount == null ? '' : String(request.passengerCount),
    notes: request.notes || '',
    status: request.status || 'OPEN',
  };
}

function toEditableJoinRequest(request) {
  return {
    requestedSeats: request.requestedSeats == null ? '' : String(request.requestedSeats),
    status: request.status || 'PENDING',
  };
}

function toEditableRideMatch(match) {
  return {
    meetingPoint: match.meetingPoint || '',
    tripStatus: match.tripStatus || 'CONFIRMED',
  };
}

function toEditableRideRequestOffer(offer) {
  return {
    proposedSeats: offer.proposedSeats == null ? '' : String(offer.proposedSeats),
    meetingPoint: offer.meetingPoint || '',
    status: offer.status || 'PENDING',
  };
}

function toEditableRating(rating) {
  return {
    raterUserId: rating.raterUserId == null ? '' : String(rating.raterUserId),
    score: rating.score == null ? '' : String(rating.score),
    comment: rating.comment || '',
  };
}

function buildEditMap(items, keyName, mapper) {
  return (items || []).reduce((acc, item) => {
    acc[item[keyName]] = mapper(item);
    return acc;
  }, {});
}

function filterByQuery(items, query, valueGetter) {
  const normalizedQuery = (query || '').trim().toLowerCase();
  if (!normalizedQuery) {
    return items || [];
  }
  return (items || []).filter((item) => {
    const values = valueGetter(item);
    const haystack = values
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase())
      .join(' ');
    return haystack.includes(normalizedQuery);
  });
}

function isFormDirty(currentItem, currentForm, mapper) {
  if (!currentItem) {
    return false;
  }
  const baseline = mapper(currentItem);
  const current = currentForm || baseline;
  return JSON.stringify(current) !== JSON.stringify(baseline);
}

function paginateItems(items, page, pageSize) {
  const normalizedItems = items || [];
  const normalizedPageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 8;
  const totalPages = Math.max(1, Math.ceil(normalizedItems.length / normalizedPageSize));
  const safePage = Math.min(Math.max(1, page || 1), totalPages);
  const start = (safePage - 1) * normalizedPageSize;
  return {
    items: normalizedItems.slice(start, start + normalizedPageSize),
    page: safePage,
    pageSize: normalizedPageSize,
    totalPages,
    totalItems: normalizedItems.length,
  };
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { session, role, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [rideOffers, setRideOffers] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  const [rideRequestOffers, setRideRequestOffers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [rideMatches, setRideMatches] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [rideOfferEditMap, setRideOfferEditMap] = useState({});
  const [rideRequestEditMap, setRideRequestEditMap] = useState({});
  const [rideRequestOfferEditMap, setRideRequestOfferEditMap] = useState({});
  const [joinRequestEditMap, setJoinRequestEditMap] = useState({});
  const [rideMatchEditMap, setRideMatchEditMap] = useState({});
  const [ratingEditMap, setRatingEditMap] = useState({});
  const [sectionSaving, setSectionSaving] = useState({});
  const [sectionSearchMap, setSectionSearchMap] = useState({
    users: '',
    offers: '',
    requests: '',
    requestOffers: '',
    joins: '',
    matches: '',
    ratings: '',
  });
  const [editorOpenMap, setEditorOpenMap] = useState({});
  const [sectionPageMap, setSectionPageMap] = useState({
    users: { page: 1, pageSize: 8 },
    offers: { page: 1, pageSize: 8 },
    requests: { page: 1, pageSize: 8 },
    requestOffers: { page: 1, pageSize: 8 },
    joins: { page: 1, pageSize: 8 },
    matches: { page: 1, pageSize: 8 },
    ratings: { page: 1, pageSize: 8 },
  });
  const [sectionSelectionMap, setSectionSelectionMap] = useState({
    users: {},
    offers: {},
    requests: {},
    requestOffers: {},
    joins: {},
    matches: {},
  });
  const [bulkActionMap, setBulkActionMap] = useState({
    usersStatus: '',
    offersStatus: '',
    requestsStatus: '',
    requestOffersStatus: '',
    joinsStatus: '',
    matchesStatus: '',
  });

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const adminSessionKey = session?.adminSessionKey || '';

  const selectedUser = useMemo(
    () => users.find((user) => user.userId === selectedUserId) || null,
    [selectedUserId, users],
  );

  const filteredUsers = useMemo(
    () => filterByQuery(users, sectionSearchMap.users, (user) => [
      user.userId,
      user.role,
      user.fullName,
      user.email,
      user.accountStatus,
      user.phone,
      user.suburb,
    ]),
    [users, sectionSearchMap.users],
  );

  const filteredRideOffers = useMemo(
    () => filterByQuery(rideOffers, sectionSearchMap.offers, (item) => [
      item.offerId,
      item.driverId,
      item.driverName,
      item.origin,
      item.destination,
      item.departureDate,
      item.departureTime,
      item.availableSeats,
      item.status,
    ]),
    [rideOffers, sectionSearchMap.offers],
  );

  const filteredRideRequests = useMemo(
    () => filterByQuery(rideRequests, sectionSearchMap.requests, (item) => [
      item.rideRequestId,
      item.riderId,
      item.riderName,
      item.origin,
      item.destination,
      item.tripDate,
      item.tripTime,
      item.passengerCount,
      item.notes,
      item.status,
    ]),
    [rideRequests, sectionSearchMap.requests],
  );

  const filteredRideRequestOffers = useMemo(
    () => filterByQuery(rideRequestOffers, sectionSearchMap.requestOffers, (item) => [
      item.offerId,
      item.rideRequestId,
      item.driverId,
      item.driverName,
      item.riderId,
      item.riderName,
      item.proposedSeats,
      item.meetingPoint,
      item.status,
      item.createdAt,
    ]),
    [rideRequestOffers, sectionSearchMap.requestOffers],
  );

  const filteredJoinRequests = useMemo(
    () => filterByQuery(joinRequests, sectionSearchMap.joins, (item) => [
      item.joinRequestId,
      item.rideOfferId,
      item.riderId,
      item.riderName,
      item.requestedSeats,
      item.status,
      item.requestDateTime,
    ]),
    [joinRequests, sectionSearchMap.joins],
  );

  const filteredRideMatches = useMemo(
    () => filterByQuery(rideMatches, sectionSearchMap.matches, (item) => [
      item.rideMatchId,
      item.driverId,
      item.driverName,
      item.riderId,
      item.riderName,
      item.rideOfferId,
      item.rideRequestId,
      item.acceptedJoinRequestId,
      item.acceptedRideRequestOfferId,
      item.meetingPoint,
      item.tripStatus,
      item.confirmedDateTime,
    ]),
    [rideMatches, sectionSearchMap.matches],
  );

  const filteredRatings = useMemo(
    () => filterByQuery(ratings, sectionSearchMap.ratings, (item) => [
      item.ratingId,
      item.targetUserId,
      item.targetUserName,
      item.raterUserId,
      item.raterUserName,
      item.score,
      item.comment,
      item.createdDate,
    ]),
    [ratings, sectionSearchMap.ratings],
  );

  const pagedUsers = useMemo(
    () => paginateItems(filteredUsers, sectionPageMap.users.page, sectionPageMap.users.pageSize),
    [filteredUsers, sectionPageMap.users.page, sectionPageMap.users.pageSize],
  );
  const pagedRideOffers = useMemo(
    () => paginateItems(filteredRideOffers, sectionPageMap.offers.page, sectionPageMap.offers.pageSize),
    [filteredRideOffers, sectionPageMap.offers.page, sectionPageMap.offers.pageSize],
  );
  const pagedRideRequests = useMemo(
    () => paginateItems(filteredRideRequests, sectionPageMap.requests.page, sectionPageMap.requests.pageSize),
    [filteredRideRequests, sectionPageMap.requests.page, sectionPageMap.requests.pageSize],
  );
  const pagedRideRequestOffers = useMemo(
    () => paginateItems(filteredRideRequestOffers, sectionPageMap.requestOffers.page, sectionPageMap.requestOffers.pageSize),
    [filteredRideRequestOffers, sectionPageMap.requestOffers.page, sectionPageMap.requestOffers.pageSize],
  );
  const pagedJoinRequests = useMemo(
    () => paginateItems(filteredJoinRequests, sectionPageMap.joins.page, sectionPageMap.joins.pageSize),
    [filteredJoinRequests, sectionPageMap.joins.page, sectionPageMap.joins.pageSize],
  );
  const pagedRideMatches = useMemo(
    () => paginateItems(filteredRideMatches, sectionPageMap.matches.page, sectionPageMap.matches.pageSize),
    [filteredRideMatches, sectionPageMap.matches.page, sectionPageMap.matches.pageSize],
  );
  const pagedRatings = useMemo(
    () => paginateItems(filteredRatings, sectionPageMap.ratings.page, sectionPageMap.ratings.pageSize),
    [filteredRatings, sectionPageMap.ratings.page, sectionPageMap.ratings.pageSize],
  );

  useEffect(() => {
    if (role !== 'ADMIN') {
      navigate('/', { replace: true });
    }
  }, [navigate, role]);

  useEffect(() => {
    if (role !== 'ADMIN') {
      return;
    }
    if (!adminSessionKey) {
      setError('Admin session is missing. Please sign in again.');
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError('');
    setMessage('');

    Promise.all([
      getAdminOverview(adminSessionKey),
      getAdminUsers(adminSessionKey),
      getAdminRideOffers(adminSessionKey),
      getAdminRideRequests(adminSessionKey),
      getAdminRideRequestOffers(adminSessionKey),
      getAdminJoinRequests(adminSessionKey),
      getAdminRideMatches(adminSessionKey),
      getAdminRatings(adminSessionKey),
    ])
      .then(([
        overviewData,
        userData,
        offerData,
        requestData,
        rideRequestOfferData,
        joinData,
        matchData,
        ratingData,
      ]) => {
        if (!active) {
          return;
        }
        setOverview(overviewData || null);
        setUsers(Array.isArray(userData) ? userData : []);
        const normalizedOffers = Array.isArray(offerData) ? offerData : [];
        const normalizedRequests = Array.isArray(requestData) ? requestData : [];
        const normalizedRideRequestOffers = Array.isArray(rideRequestOfferData) ? rideRequestOfferData : [];
        const normalizedJoinRequests = Array.isArray(joinData) ? joinData : [];
        const normalizedMatches = Array.isArray(matchData) ? matchData : [];
        const normalizedRatings = Array.isArray(ratingData) ? ratingData : [];
        setRideOffers(normalizedOffers);
        setRideRequests(normalizedRequests);
        setRideRequestOffers(normalizedRideRequestOffers);
        setJoinRequests(normalizedJoinRequests);
        setRideMatches(normalizedMatches);
        setRatings(normalizedRatings);
        setRideOfferEditMap(buildEditMap(normalizedOffers, 'offerId', toEditableRideOffer));
        setRideRequestEditMap(buildEditMap(normalizedRequests, 'rideRequestId', toEditableRideRequest));
        setRideRequestOfferEditMap(
          buildEditMap(normalizedRideRequestOffers, 'offerId', toEditableRideRequestOffer),
        );
        setJoinRequestEditMap(buildEditMap(normalizedJoinRequests, 'joinRequestId', toEditableJoinRequest));
        setRideMatchEditMap(buildEditMap(normalizedMatches, 'rideMatchId', toEditableRideMatch));
        setRatingEditMap(buildEditMap(normalizedRatings, 'ratingId', toEditableRating));
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError.message || 'Unable to load admin dashboard data.');
          setRideOfferEditMap({});
          setRideRequestEditMap({});
          setRideRequestOfferEditMap({});
          setJoinRequestEditMap({});
          setRideMatchEditMap({});
          setRatingEditMap({});
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
  }, [adminSessionKey, role]);

  useEffect(() => {
    if (users.length === 0) {
      setSelectedUserId(null);
      setEditForm(null);
      return;
    }
    const exists = users.some((user) => user.userId === selectedUserId);
    const nextSelectedId = exists ? selectedUserId : users[0].userId;
    setSelectedUserId(nextSelectedId);
    const nextSelectedUser = users.find((user) => user.userId === nextSelectedId) || null;
    setEditForm(toEditableUser(nextSelectedUser));
  }, [selectedUserId, users]);

  function handleSelectUser(user) {
    setSelectedUserId(user.userId);
    setEditForm(toEditableUser(user));
    setMessage('');
    setError('');
  }

  function updateEditField(name, value) {
    setEditForm((prev) => ({
      ...(prev || {}),
      [name]: value,
    }));
  }

  function isSectionSaving(section, id) {
    return Boolean(sectionSaving[`${section}-${id}`]);
  }

  function setSectionSavingState(section, id, value) {
    setSectionSaving((prev) => ({
      ...prev,
      [`${section}-${id}`]: value,
    }));
  }

  function updateSectionSearch(section, value) {
    setSectionSearchMap((prev) => ({
      ...prev,
      [section]: value,
    }));
    setSectionPageMap((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || { page: 1, pageSize: 8 }),
        page: 1,
      },
    }));
  }

  function updateSectionPage(section, page) {
    setSectionPageMap((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || { page: 1, pageSize: 8 }),
        page: Math.max(1, page),
      },
    }));
  }

  function updateSectionPageSize(section, pageSize) {
    const parsed = Number(pageSize);
    setSectionPageMap((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || { page: 1, pageSize: 8 }),
        page: 1,
        pageSize: Number.isInteger(parsed) && parsed > 0 ? parsed : 8,
      },
    }));
  }

  function updateBulkAction(name, value) {
    setBulkActionMap((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function isRowSelected(section, id) {
    return Boolean(sectionSelectionMap[section]?.[id]);
  }

  function toggleRowSelection(section, id) {
    setSectionSelectionMap((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [id]: !prev[section]?.[id],
      },
    }));
  }

  function toggleSelectPage(section, ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return;
    }
    const allSelected = ids.every((id) => Boolean(sectionSelectionMap[section]?.[id]));
    setSectionSelectionMap((prev) => {
      const nextSection = { ...(prev[section] || {}) };
      ids.forEach((id) => {
        if (allSelected) {
          delete nextSection[id];
        } else {
          nextSection[id] = true;
        }
      });
      return {
        ...prev,
        [section]: nextSection,
      };
    });
  }

  function clearSectionSelection(section) {
    setSectionSelectionMap((prev) => ({
      ...prev,
      [section]: {},
    }));
  }

  function getSelectedIds(section) {
    const selection = sectionSelectionMap[section] || {};
    return Object.keys(selection)
      .filter((id) => selection[id])
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
  }

  function isEditorOpen(section, id) {
    return Boolean(editorOpenMap[`${section}-${id}`]);
  }

  function setEditorOpenState(section, id, open) {
    setEditorOpenMap((prev) => ({
      ...prev,
      [`${section}-${id}`]: open,
    }));
  }

  function toggleEditor(section, id) {
    setEditorOpenState(section, id, !isEditorOpen(section, id));
  }

  function updateRideOfferEditField(offerId, field, value) {
    setRideOfferEditMap((prev) => ({
      ...prev,
      [offerId]: {
        ...toEditableRideOffer(rideOffers.find((item) => item.offerId === offerId) || {}),
        ...(prev[offerId] || {}),
        [field]: value,
      },
    }));
  }

  function updateRideRequestEditField(rideRequestId, field, value) {
    setRideRequestEditMap((prev) => ({
      ...prev,
      [rideRequestId]: {
        ...toEditableRideRequest(rideRequests.find((item) => item.rideRequestId === rideRequestId) || {}),
        ...(prev[rideRequestId] || {}),
        [field]: value,
      },
    }));
  }

  function updateRideRequestOfferEditField(offerId, field, value) {
    setRideRequestOfferEditMap((prev) => ({
      ...prev,
      [offerId]: {
        ...toEditableRideRequestOffer(rideRequestOffers.find((item) => item.offerId === offerId) || {}),
        ...(prev[offerId] || {}),
        [field]: value,
      },
    }));
  }

  function updateJoinRequestEditField(joinRequestId, field, value) {
    setJoinRequestEditMap((prev) => ({
      ...prev,
      [joinRequestId]: {
        ...toEditableJoinRequest(joinRequests.find((item) => item.joinRequestId === joinRequestId) || {}),
        ...(prev[joinRequestId] || {}),
        [field]: value,
      },
    }));
  }

  function updateRideMatchEditField(rideMatchId, field, value) {
    setRideMatchEditMap((prev) => ({
      ...prev,
      [rideMatchId]: {
        ...toEditableRideMatch(rideMatches.find((item) => item.rideMatchId === rideMatchId) || {}),
        ...(prev[rideMatchId] || {}),
        [field]: value,
      },
    }));
  }

  function updateRatingEditField(ratingId, field, value) {
    setRatingEditMap((prev) => ({
      ...prev,
      [ratingId]: {
        ...toEditableRating(ratings.find((item) => item.ratingId === ratingId) || {}),
        ...(prev[ratingId] || {}),
        [field]: value,
      },
    }));
  }

  function resetRideOfferEdit(offerId) {
    const item = rideOffers.find((value) => value.offerId === offerId);
    if (!item) {
      return;
    }
    setRideOfferEditMap((prev) => ({
      ...prev,
      [offerId]: toEditableRideOffer(item),
    }));
  }

  function resetRideRequestEdit(rideRequestId) {
    const item = rideRequests.find((value) => value.rideRequestId === rideRequestId);
    if (!item) {
      return;
    }
    setRideRequestEditMap((prev) => ({
      ...prev,
      [rideRequestId]: toEditableRideRequest(item),
    }));
  }

  function resetRideRequestOfferEdit(offerId) {
    const item = rideRequestOffers.find((value) => value.offerId === offerId);
    if (!item) {
      return;
    }
    setRideRequestOfferEditMap((prev) => ({
      ...prev,
      [offerId]: toEditableRideRequestOffer(item),
    }));
  }

  function resetJoinRequestEdit(joinRequestId) {
    const item = joinRequests.find((value) => value.joinRequestId === joinRequestId);
    if (!item) {
      return;
    }
    setJoinRequestEditMap((prev) => ({
      ...prev,
      [joinRequestId]: toEditableJoinRequest(item),
    }));
  }

  function resetRideMatchEdit(rideMatchId) {
    const item = rideMatches.find((value) => value.rideMatchId === rideMatchId);
    if (!item) {
      return;
    }
    setRideMatchEditMap((prev) => ({
      ...prev,
      [rideMatchId]: toEditableRideMatch(item),
    }));
  }

  function resetRatingEdit(ratingId) {
    const item = ratings.find((value) => value.ratingId === ratingId);
    if (!item) {
      return;
    }
    setRatingEditMap((prev) => ({
      ...prev,
      [ratingId]: toEditableRating(item),
    }));
  }

  async function handleSaveUser(event) {
    event.preventDefault();
    if (!selectedUser || !editForm) {
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        suburb: editForm.suburb,
        accountStatus: editForm.accountStatus,
        bio: editForm.bio,
        travelPreferences: editForm.travelPreferences,
        trustNotes: editForm.trustNotes,
      };

      if (selectedUser.role === 'DRIVER') {
        payload.driverLicenceVerifiedStatus = editForm.driverLicenceVerifiedStatus;
        payload.driverVehicleInfo = editForm.driverVehicleInfo;
        payload.driverVerificationNotes = editForm.driverVerificationNotes;
        if (editForm.driverSpareSeatCapacity.trim() !== '') {
          payload.driverSpareSeatCapacity = Number(editForm.driverSpareSeatCapacity);
        }
      }
      if (selectedUser.role === 'RIDER') {
        payload.riderPreferredTravelTimes = editForm.riderPreferredTravelTimes;
        payload.riderUsualDestinations = editForm.riderUsualDestinations;
      }

      const updated = await updateAdminUser(adminSessionKey, selectedUser.userId, payload);
      setUsers((prev) => prev.map((item) => (item.userId === updated.userId ? updated : item)));
      setEditForm(toEditableUser(updated));
      setMessage(`User #${updated.userId} updated successfully.`);
    } catch (saveError) {
      setError(saveError.message || 'Unable to update this user right now.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRideOffer(offerId) {
    const form = rideOfferEditMap[offerId];
    if (!form) {
      return;
    }
    const availableSeats = Number(form.availableSeats);
    if (!Number.isInteger(availableSeats) || availableSeats < 0) {
      setError('Ride offer available seats must be a whole number >= 0.');
      return;
    }

    setError('');
    setMessage('');
    setSectionSavingState('offer', offerId, true);
    try {
      const updated = await updateAdminRideOffer(adminSessionKey, offerId, {
        origin: form.origin,
        destination: form.destination,
        departureDate: form.departureDate,
        departureTime: form.departureTime,
        availableSeats,
        status: form.status,
      });
      setRideOffers((prev) => prev.map((item) => (item.offerId === updated.offerId ? updated : item)));
      setRideOfferEditMap((prev) => ({
        ...prev,
        [offerId]: toEditableRideOffer(updated),
      }));
      setEditorOpenState('offer', offerId, false);
      setMessage(`Ride offer #${offerId} updated.`);
    } catch (saveError) {
      setError(saveError.message || 'Unable to update ride offer.');
    } finally {
      setSectionSavingState('offer', offerId, false);
    }
  }

  async function handleSaveRideRequest(rideRequestId) {
    const form = rideRequestEditMap[rideRequestId];
    if (!form) {
      return;
    }
    const passengerCount = Number(form.passengerCount);
    if (!Number.isInteger(passengerCount) || passengerCount < 1) {
      setError('Ride request passenger count must be a whole number >= 1.');
      return;
    }

    setError('');
    setMessage('');
    setSectionSavingState('request', rideRequestId, true);
    try {
      const updated = await updateAdminRideRequest(adminSessionKey, rideRequestId, {
        origin: form.origin,
        destination: form.destination,
        tripDate: form.tripDate,
        tripTime: form.tripTime,
        passengerCount,
        notes: form.notes,
        status: form.status,
      });
      setRideRequests((prev) => prev.map((item) => (item.rideRequestId === updated.rideRequestId ? updated : item)));
      setRideRequestEditMap((prev) => ({
        ...prev,
        [rideRequestId]: toEditableRideRequest(updated),
      }));
      setEditorOpenState('request', rideRequestId, false);
      setMessage(`Ride request #${rideRequestId} updated.`);
    } catch (saveError) {
      setError(saveError.message || 'Unable to update ride request.');
    } finally {
      setSectionSavingState('request', rideRequestId, false);
    }
  }

  async function handleSaveRideRequestOffer(offerId) {
    const form = rideRequestOfferEditMap[offerId];
    if (!form) {
      return;
    }
    const proposedSeats = Number(form.proposedSeats);
    if (!Number.isInteger(proposedSeats) || proposedSeats < 1) {
      setError('Ride request offer proposed seats must be a whole number >= 1.');
      return;
    }

    setError('');
    setMessage('');
    setSectionSavingState('request-offer', offerId, true);
    try {
      const updated = await updateAdminRideRequestOffer(adminSessionKey, offerId, {
        proposedSeats,
        meetingPoint: form.meetingPoint,
        status: form.status,
      });
      setRideRequestOffers((prev) => prev.map((item) => (item.offerId === updated.offerId ? updated : item)));
      setRideRequestOfferEditMap((prev) => ({
        ...prev,
        [offerId]: toEditableRideRequestOffer(updated),
      }));
      setEditorOpenState('request-offer', offerId, false);
      setMessage(`Ride request offer #${offerId} updated.`);
    } catch (saveError) {
      setError(saveError.message || 'Unable to update ride request offer.');
    } finally {
      setSectionSavingState('request-offer', offerId, false);
    }
  }

  async function handleSaveJoinRequest(joinRequestId) {
    const form = joinRequestEditMap[joinRequestId];
    if (!form) {
      return;
    }
    const requestedSeats = Number(form.requestedSeats);
    if (!Number.isInteger(requestedSeats) || requestedSeats < 1) {
      setError('Join request seats must be a whole number >= 1.');
      return;
    }

    setError('');
    setMessage('');
    setSectionSavingState('join', joinRequestId, true);
    try {
      const updated = await updateAdminJoinRequest(adminSessionKey, joinRequestId, {
        requestedSeats,
        status: form.status,
      });
      setJoinRequests((prev) => prev.map((item) => (item.joinRequestId === updated.joinRequestId ? updated : item)));
      setJoinRequestEditMap((prev) => ({
        ...prev,
        [joinRequestId]: toEditableJoinRequest(updated),
      }));
      setEditorOpenState('join', joinRequestId, false);
      setMessage(`Join request #${joinRequestId} updated.`);
    } catch (saveError) {
      setError(saveError.message || 'Unable to update join request.');
    } finally {
      setSectionSavingState('join', joinRequestId, false);
    }
  }

  async function handleSaveRideMatch(rideMatchId) {
    const form = rideMatchEditMap[rideMatchId];
    if (!form) {
      return;
    }

    setError('');
    setMessage('');
    setSectionSavingState('match', rideMatchId, true);
    try {
      const updated = await updateAdminRideMatch(adminSessionKey, rideMatchId, {
        meetingPoint: form.meetingPoint,
        tripStatus: form.tripStatus,
      });
      setRideMatches((prev) => prev.map((item) => (item.rideMatchId === updated.rideMatchId ? updated : item)));
      setRideMatchEditMap((prev) => ({
        ...prev,
        [rideMatchId]: toEditableRideMatch(updated),
      }));
      setEditorOpenState('match', rideMatchId, false);
      setMessage(`Ride match #${rideMatchId} updated.`);
    } catch (saveError) {
      setError(saveError.message || 'Unable to update ride match.');
    } finally {
      setSectionSavingState('match', rideMatchId, false);
    }
  }

  async function handleSaveRating(ratingId) {
    const form = ratingEditMap[ratingId];
    if (!form) {
      return;
    }
    const raterUserId = Number(form.raterUserId);
    const score = Number(form.score);

    if (!Number.isInteger(raterUserId) || raterUserId < 1) {
      setError('Rating rater user id must be a valid positive user id.');
      return;
    }
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      setError('Rating score must be a whole number between 1 and 5.');
      return;
    }

    setError('');
    setMessage('');
    setSectionSavingState('rating', ratingId, true);
    try {
      const updated = await updateAdminRating(adminSessionKey, ratingId, {
        raterUserId,
        score,
        comment: form.comment,
      });
      setRatings((prev) => prev.map((item) => (item.ratingId === updated.ratingId ? updated : item)));
      setRatingEditMap((prev) => ({
        ...prev,
        [ratingId]: toEditableRating(updated),
      }));
      setEditorOpenState('rating', ratingId, false);
      setMessage(`Rating #${ratingId} updated.`);
    } catch (saveError) {
      setError(saveError.message || 'Unable to update rating.');
    } finally {
      setSectionSavingState('rating', ratingId, false);
    }
  }

  async function handleBulkUserStatusUpdate() {
    const accountStatus = bulkActionMap.usersStatus;
    const userIds = getSelectedIds('users');
    if (!accountStatus || userIds.length === 0) {
      setError('Select at least one user and one target account status.');
      return;
    }

    setError('');
    setMessage('');
    setSectionSavingState('users', 'bulk', true);
    try {
      const updatedUsers = await Promise.all(
        userIds.map((userId) => updateAdminUser(adminSessionKey, userId, { accountStatus })),
      );
      const updatedMap = new Map(updatedUsers.map((item) => [item.userId, item]));
      setUsers((prev) => prev.map((item) => updatedMap.get(item.userId) || item));
      setEditForm((prev) => {
        if (!prev || !selectedUserId) {
          return prev;
        }
        const selectedUpdated = updatedMap.get(selectedUserId);
        return selectedUpdated ? toEditableUser(selectedUpdated) : prev;
      });
      clearSectionSelection('users');
      setMessage(`Updated ${updatedUsers.length} users to status ${accountStatus}.`);
    } catch (bulkError) {
      setError(bulkError.message || 'Unable to bulk update user status.');
    } finally {
      setSectionSavingState('users', 'bulk', false);
    }
  }

  async function handleBulkRideOfferStatusUpdate() {
    const status = bulkActionMap.offersStatus;
    const ids = getSelectedIds('offers');
    if (!status || ids.length === 0) {
      setError('Select at least one ride offer and one target status.');
      return;
    }

    setError('');
    setMessage('');
    setSectionSavingState('offer', 'bulk', true);
    try {
      const updatedItems = await Promise.all(
        ids.map((offerId) => updateAdminRideOffer(adminSessionKey, offerId, { status })),
      );
      const updatedMap = new Map(updatedItems.map((item) => [item.offerId, item]));
      setRideOffers((prev) => prev.map((item) => updatedMap.get(item.offerId) || item));
      setRideOfferEditMap((prev) => {
        const next = { ...prev };
        updatedItems.forEach((item) => {
          next[item.offerId] = toEditableRideOffer(item);
        });
        return next;
      });
      clearSectionSelection('offers');
      setMessage(`Updated ${updatedItems.length} ride offers to status ${status}.`);
    } catch (bulkError) {
      setError(bulkError.message || 'Unable to bulk update ride offer status.');
    } finally {
      setSectionSavingState('offer', 'bulk', false);
    }
  }

  async function handleBulkRideRequestStatusUpdate() {
    const status = bulkActionMap.requestsStatus;
    const ids = getSelectedIds('requests');
    if (!status || ids.length === 0) {
      setError('Select at least one ride request and one target status.');
      return;
    }

    setError('');
    setMessage('');
    setSectionSavingState('request', 'bulk', true);
    try {
      const updatedItems = await Promise.all(
        ids.map((rideRequestId) => updateAdminRideRequest(adminSessionKey, rideRequestId, { status })),
      );
      const updatedMap = new Map(updatedItems.map((item) => [item.rideRequestId, item]));
      setRideRequests((prev) => prev.map((item) => updatedMap.get(item.rideRequestId) || item));
      setRideRequestEditMap((prev) => {
        const next = { ...prev };
        updatedItems.forEach((item) => {
          next[item.rideRequestId] = toEditableRideRequest(item);
        });
        return next;
      });
      clearSectionSelection('requests');
      setMessage(`Updated ${updatedItems.length} ride requests to status ${status}.`);
    } catch (bulkError) {
      setError(bulkError.message || 'Unable to bulk update ride request status.');
    } finally {
      setSectionSavingState('request', 'bulk', false);
    }
  }

  async function handleBulkRideRequestOfferStatusUpdate() {
    const status = bulkActionMap.requestOffersStatus;
    const ids = getSelectedIds('requestOffers');
    if (!status || ids.length === 0) {
      setError('Select at least one one-off offer and one target status.');
      return;
    }

    setError('');
    setMessage('');
    setSectionSavingState('request-offer', 'bulk', true);
    try {
      const updatedItems = await Promise.all(
        ids.map((offerId) => updateAdminRideRequestOffer(adminSessionKey, offerId, { status })),
      );
      const updatedMap = new Map(updatedItems.map((item) => [item.offerId, item]));
      setRideRequestOffers((prev) => prev.map((item) => updatedMap.get(item.offerId) || item));
      setRideRequestOfferEditMap((prev) => {
        const next = { ...prev };
        updatedItems.forEach((item) => {
          next[item.offerId] = toEditableRideRequestOffer(item);
        });
        return next;
      });
      clearSectionSelection('requestOffers');
      setMessage(`Updated ${updatedItems.length} one-off offers to status ${status}.`);
    } catch (bulkError) {
      setError(bulkError.message || 'Unable to bulk update one-off offer status.');
    } finally {
      setSectionSavingState('request-offer', 'bulk', false);
    }
  }

  async function handleBulkJoinRequestStatusUpdate() {
    const status = bulkActionMap.joinsStatus;
    const ids = getSelectedIds('joins');
    if (!status || ids.length === 0) {
      setError('Select at least one join request and one target status.');
      return;
    }

    setError('');
    setMessage('');
    setSectionSavingState('join', 'bulk', true);
    try {
      const updatedItems = await Promise.all(
        ids.map((joinRequestId) => updateAdminJoinRequest(adminSessionKey, joinRequestId, { status })),
      );
      const updatedMap = new Map(updatedItems.map((item) => [item.joinRequestId, item]));
      setJoinRequests((prev) => prev.map((item) => updatedMap.get(item.joinRequestId) || item));
      setJoinRequestEditMap((prev) => {
        const next = { ...prev };
        updatedItems.forEach((item) => {
          next[item.joinRequestId] = toEditableJoinRequest(item);
        });
        return next;
      });
      clearSectionSelection('joins');
      setMessage(`Updated ${updatedItems.length} join requests to status ${status}.`);
    } catch (bulkError) {
      setError(bulkError.message || 'Unable to bulk update join request status.');
    } finally {
      setSectionSavingState('join', 'bulk', false);
    }
  }

  async function handleBulkRideMatchStatusUpdate() {
    const tripStatus = bulkActionMap.matchesStatus;
    const ids = getSelectedIds('matches');
    if (!tripStatus || ids.length === 0) {
      setError('Select at least one ride match and one target trip status.');
      return;
    }

    setError('');
    setMessage('');
    setSectionSavingState('match', 'bulk', true);
    try {
      const updatedItems = await Promise.all(
        ids.map((rideMatchId) => updateAdminRideMatch(adminSessionKey, rideMatchId, { tripStatus })),
      );
      const updatedMap = new Map(updatedItems.map((item) => [item.rideMatchId, item]));
      setRideMatches((prev) => prev.map((item) => updatedMap.get(item.rideMatchId) || item));
      setRideMatchEditMap((prev) => {
        const next = { ...prev };
        updatedItems.forEach((item) => {
          next[item.rideMatchId] = toEditableRideMatch(item);
        });
        return next;
      });
      clearSectionSelection('matches');
      setMessage(`Updated ${updatedItems.length} ride matches to trip status ${tripStatus}.`);
    } catch (bulkError) {
      setError(bulkError.message || 'Unable to bulk update ride match status.');
    } finally {
      setSectionSavingState('match', 'bulk', false);
    }
  }

  function renderPaginationControls(section, paged) {
    return (
      <div className="admin-pager">
        <div className="admin-page-size">
          <span>Rows</span>
          <select
            value={paged.pageSize}
            onChange={(event) => updateSectionPageSize(section, Number(event.target.value))}
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="admin-page-nav">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => updateSectionPage(section, paged.page - 1)}
            disabled={paged.page <= 1}
          >
            Prev
          </button>
          <span>Page {paged.page} / {paged.totalPages}</span>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => updateSectionPage(section, paged.page + 1)}
            disabled={paged.page >= paged.totalPages}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div>
          <h1>Admin Control Panel</h1>
          <p className="admin-subtitle">Fixed-account operational view for all rider/driver data.</p>
        </div>
        <div className="form-actions admin-top-actions">
          <Link className="btn btn-secondary" to="/intro">Public Intro</Link>
          <button className="btn" type="button" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <main className="admin-content page-stack">
        {loading ? <p>Loading admin dashboard...</p> : null}
        {error ? <p className="status-error">{error}</p> : null}
        {message ? <p>{message}</p> : null}

        {!loading && !error ? (
          <>
            <section className="admin-kpi-grid">
              <article className="admin-kpi-card">
                <strong>{overview?.totalUsers ?? 0}</strong>
                <span>Total Users</span>
              </article>
              <article className="admin-kpi-card">
                <strong>{overview?.totalRiders ?? 0}</strong>
                <span>Riders</span>
              </article>
              <article className="admin-kpi-card">
                <strong>{overview?.totalDrivers ?? 0}</strong>
                <span>Drivers</span>
              </article>
              <article className="admin-kpi-card">
                <strong>{overview?.openRideOffers ?? 0}</strong>
                <span>Open Ride Offers</span>
              </article>
              <article className="admin-kpi-card">
                <strong>{overview?.openRideRequests ?? 0}</strong>
                <span>Open Ride Requests</span>
              </article>
              <article className="admin-kpi-card">
                <strong>{overview?.pendingJoinRequests ?? 0}</strong>
                <span>Pending Join Requests</span>
              </article>
            </section>

            <SectionCard title="All Users - Manage Profile and Account Data">
              <div className="admin-two-column">
                <div className="admin-table-wrap">
                  <div className="admin-filter-bar">
                    <input
                      type="search"
                      placeholder="Search users by id, name, email, role..."
                      value={sectionSearchMap.users}
                      onChange={(event) => updateSectionSearch('users', event.target.value)}
                    />
                    <span>{filteredUsers.length}/{users.length}</span>
                  </div>
                  <div className="admin-bulk-bar">
                    <span>{getSelectedIds('users').length} selected</span>
                    <select
                      value={bulkActionMap.usersStatus}
                      onChange={(event) => updateBulkAction('usersStatus', event.target.value)}
                    >
                      <option value="">Bulk account status...</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleBulkUserStatusUpdate}
                      disabled={isSectionSaving('users', 'bulk') || getSelectedIds('users').length === 0 || !bulkActionMap.usersStatus}
                    >
                      {isSectionSaving('users', 'bulk') ? 'Applying...' : 'Apply'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => clearSectionSelection('users')}
                      disabled={getSelectedIds('users').length === 0}
                    >
                      Clear
                    </button>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={
                              pagedUsers.items.length > 0
                              && pagedUsers.items.every((user) => isRowSelected('users', user.userId))
                            }
                            onChange={() => toggleSelectPage('users', pagedUsers.items.map((user) => user.userId))}
                          />
                        </th>
                        <th>ID</th>
                        <th>Role</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedUsers.items.map((user) => (
                        <tr key={user.userId} className={user.userId === selectedUserId ? 'is-selected' : ''}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isRowSelected('users', user.userId)}
                              onChange={() => toggleRowSelection('users', user.userId)}
                            />
                          </td>
                          <td>{user.userId}</td>
                          <td>{user.role}</td>
                          <td>{user.fullName}</td>
                          <td>{user.email}</td>
                          <td>{user.accountStatus}</td>
                          <td>
                            <button className="btn btn-secondary" type="button" onClick={() => handleSelectUser(user)}>
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="7">No users match the current search.</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                  {renderPaginationControls('users', pagedUsers)}
                </div>

                <form className="form-grid admin-edit-form" onSubmit={handleSaveUser}>
                  <h3>Edit Selected User</h3>
                  {!selectedUser || !editForm ? <p>Select a user first.</p> : (
                    <>
                      <label>
                        Full name
                        <input
                          type="text"
                          value={editForm.fullName}
                          onChange={(event) => updateEditField('fullName', event.target.value)}
                          disabled={saving}
                        />
                      </label>
                      <label>
                        Email
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(event) => updateEditField('email', event.target.value)}
                          disabled={saving}
                        />
                      </label>
                      <label>
                        Phone
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(event) => updateEditField('phone', event.target.value)}
                          disabled={saving}
                        />
                      </label>
                      <label>
                        Suburb
                        <input
                          type="text"
                          value={editForm.suburb}
                          onChange={(event) => updateEditField('suburb', event.target.value)}
                          disabled={saving}
                        />
                      </label>
                      <label>
                        Account status
                        <select
                          value={editForm.accountStatus}
                          onChange={(event) => updateEditField('accountStatus', event.target.value)}
                          disabled={saving}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      </label>
                      <label>
                        Bio
                        <textarea
                          rows="2"
                          value={editForm.bio}
                          onChange={(event) => updateEditField('bio', event.target.value)}
                          disabled={saving}
                        />
                      </label>
                      <label>
                        Travel preferences
                        <textarea
                          rows="2"
                          value={editForm.travelPreferences}
                          onChange={(event) => updateEditField('travelPreferences', event.target.value)}
                          disabled={saving}
                        />
                      </label>
                      <label>
                        Trust notes
                        <textarea
                          rows="2"
                          value={editForm.trustNotes}
                          onChange={(event) => updateEditField('trustNotes', event.target.value)}
                          disabled={saving}
                        />
                      </label>

                      {selectedUser.role === 'DRIVER' ? (
                        <>
                          <label>
                            Licence status
                            <select
                              value={editForm.driverLicenceVerifiedStatus}
                              onChange={(event) => updateEditField('driverLicenceVerifiedStatus', event.target.value)}
                              disabled={saving}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="VERIFIED">VERIFIED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </label>
                          <label>
                            Vehicle info
                            <input
                              type="text"
                              value={editForm.driverVehicleInfo}
                              onChange={(event) => updateEditField('driverVehicleInfo', event.target.value)}
                              disabled={saving}
                            />
                          </label>
                          <label>
                            Spare seat capacity
                            <input
                              type="number"
                              min="0"
                              value={editForm.driverSpareSeatCapacity}
                              onChange={(event) => updateEditField('driverSpareSeatCapacity', event.target.value)}
                              disabled={saving}
                            />
                          </label>
                          <div className="admin-doc-grid">
                            <p>
                              Licence document:
                              {' '}
                              {selectedUser.driverLicenceDocumentPath ? (
                                <a
                                  href={`${API_BASE_URL}/driver-documents/${selectedUser.userId}/licence`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  View
                                </a>
                              ) : 'Missing'}
                            </p>
                            <p>
                              Spare seat proof:
                              {' '}
                              {selectedUser.driverSpareSeatProofDocumentPath ? (
                                <a
                                  href={`${API_BASE_URL}/driver-documents/${selectedUser.userId}/seat-proof`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  View
                                </a>
                              ) : 'Missing'}
                            </p>
                            <p>
                              Vehicle rego:
                              {' '}
                              {selectedUser.driverVehicleRegoDocumentPath ? (
                                <a
                                  href={`${API_BASE_URL}/driver-documents/${selectedUser.userId}/rego`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  View
                                </a>
                              ) : 'Missing'}
                            </p>
                          </div>
                          <label>
                            Verification notes
                            <textarea
                              rows="2"
                              value={editForm.driverVerificationNotes}
                              onChange={(event) => updateEditField('driverVerificationNotes', event.target.value)}
                              disabled={saving}
                            />
                          </label>
                        </>
                      ) : null}

                      {selectedUser.role === 'RIDER' ? (
                        <>
                          <label>
                            Preferred travel times
                            <input
                              type="text"
                              value={editForm.riderPreferredTravelTimes}
                              onChange={(event) => updateEditField('riderPreferredTravelTimes', event.target.value)}
                              disabled={saving}
                            />
                          </label>
                          <label>
                            Usual destinations
                            <input
                              type="text"
                              value={editForm.riderUsualDestinations}
                              onChange={(event) => updateEditField('riderUsualDestinations', event.target.value)}
                              disabled={saving}
                            />
                          </label>
                        </>
                      ) : null}

                      <div className="form-actions">
                        <button className="btn" type="submit" disabled={saving}>
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </SectionCard>

            <SectionCard title="All Ride Offers">
              <div className="admin-table-wrap">
                <div className="admin-filter-bar">
                  <input
                    type="search"
                    placeholder="Search offers by id, driver, route, status..."
                    value={sectionSearchMap.offers}
                    onChange={(event) => updateSectionSearch('offers', event.target.value)}
                  />
                  <span>{filteredRideOffers.length}/{rideOffers.length}</span>
                </div>
                <div className="admin-bulk-bar">
                  <span>{getSelectedIds('offers').length} selected</span>
                  <select
                    value={bulkActionMap.offersStatus}
                    onChange={(event) => updateBulkAction('offersStatus', event.target.value)}
                  >
                    <option value="">Bulk offer status...</option>
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleBulkRideOfferStatusUpdate}
                    disabled={isSectionSaving('offer', 'bulk') || getSelectedIds('offers').length === 0 || !bulkActionMap.offersStatus}
                  >
                    {isSectionSaving('offer', 'bulk') ? 'Applying...' : 'Apply'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => clearSectionSelection('offers')}
                    disabled={getSelectedIds('offers').length === 0}
                  >
                    Clear
                  </button>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={
                            pagedRideOffers.items.length > 0
                            && pagedRideOffers.items.every((item) => isRowSelected('offers', item.offerId))
                          }
                          onChange={() => toggleSelectPage('offers', pagedRideOffers.items.map((item) => item.offerId))}
                        />
                      </th>
                      <th>ID</th>
                      <th>Driver</th>
                      <th>Route</th>
                      <th>Date/Time</th>
                      <th>Seats</th>
                      <th>Status</th>
                      <th>Admin Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRideOffers.items.map((item) => {
                      const form = rideOfferEditMap[item.offerId] || toEditableRideOffer(item);
                      const sectionBusy = isSectionSaving('offer', item.offerId);
                      const editorOpen = isEditorOpen('offer', item.offerId);
                      const dirty = isFormDirty(item, form, toEditableRideOffer);
                      return (
                        <tr key={item.offerId}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isRowSelected('offers', item.offerId)}
                              onChange={() => toggleRowSelection('offers', item.offerId)}
                            />
                          </td>
                          <td>{item.offerId}</td>
                          <td>{item.driverName} (#{item.driverId})</td>
                          <td>{item.origin} to {item.destination}</td>
                          <td>{item.departureDate} {item.departureTime}</td>
                          <td>{item.availableSeats}</td>
                          <td>{item.status}</td>
                          <td>
                            <div className="admin-inline-actions">
                              <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => toggleEditor('offer', item.offerId)}
                                disabled={sectionBusy}
                              >
                                {editorOpen ? 'Hide Editor' : 'Edit'}
                              </button>
                              {editorOpen ? (
                                <div className="admin-inline-form">
                                  <input
                                    type="text"
                                    placeholder="Origin"
                                    value={form.origin}
                                    onChange={(event) => updateRideOfferEditField(item.offerId, 'origin', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Destination"
                                    value={form.destination}
                                    onChange={(event) => updateRideOfferEditField(item.offerId, 'destination', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <input
                                    type="date"
                                    value={form.departureDate}
                                    onChange={(event) => updateRideOfferEditField(item.offerId, 'departureDate', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <input
                                    type="time"
                                    value={form.departureTime}
                                    onChange={(event) => updateRideOfferEditField(item.offerId, 'departureTime', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    value={form.availableSeats}
                                    onChange={(event) => updateRideOfferEditField(item.offerId, 'availableSeats', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <select
                                    value={form.status}
                                    onChange={(event) => updateRideOfferEditField(item.offerId, 'status', event.target.value)}
                                    disabled={sectionBusy}
                                  >
                                    <option value="OPEN">OPEN</option>
                                    <option value="CLOSED">CLOSED</option>
                                  </select>
                                  <div className="admin-inline-toolbar">
                                    <span className={dirty ? 'admin-dirty-note is-dirty' : 'admin-dirty-note'}>
                                      {dirty ? 'Unsaved changes' : 'No changes'}
                                    </span>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => resetRideOfferEdit(item.offerId)}
                                      disabled={sectionBusy || !dirty}
                                    >
                                      Reset
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => handleSaveRideOffer(item.offerId)}
                                      disabled={sectionBusy || !dirty}
                                    >
                                      {sectionBusy ? 'Saving...' : 'Save'}
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRideOffers.length === 0 ? (
                      <tr>
                        <td colSpan="8">No ride offers match the current search.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
                {renderPaginationControls('offers', pagedRideOffers)}
              </div>
            </SectionCard>

            <SectionCard title="All Ride Requests">
              <div className="admin-table-wrap">
                <div className="admin-filter-bar">
                  <input
                    type="search"
                    placeholder="Search requests by id, rider, route, status..."
                    value={sectionSearchMap.requests}
                    onChange={(event) => updateSectionSearch('requests', event.target.value)}
                  />
                  <span>{filteredRideRequests.length}/{rideRequests.length}</span>
                </div>
                <div className="admin-bulk-bar">
                  <span>{getSelectedIds('requests').length} selected</span>
                  <select
                    value={bulkActionMap.requestsStatus}
                    onChange={(event) => updateBulkAction('requestsStatus', event.target.value)}
                  >
                    <option value="">Bulk request status...</option>
                    <option value="OPEN">OPEN</option>
                    <option value="MATCHED">MATCHED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleBulkRideRequestStatusUpdate}
                    disabled={isSectionSaving('request', 'bulk') || getSelectedIds('requests').length === 0 || !bulkActionMap.requestsStatus}
                  >
                    {isSectionSaving('request', 'bulk') ? 'Applying...' : 'Apply'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => clearSectionSelection('requests')}
                    disabled={getSelectedIds('requests').length === 0}
                  >
                    Clear
                  </button>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={
                            pagedRideRequests.items.length > 0
                            && pagedRideRequests.items.every((item) => isRowSelected('requests', item.rideRequestId))
                          }
                          onChange={() => toggleSelectPage('requests', pagedRideRequests.items.map((item) => item.rideRequestId))}
                        />
                      </th>
                      <th>ID</th>
                      <th>Rider</th>
                      <th>Route</th>
                      <th>Date/Time</th>
                      <th>Passengers</th>
                      <th>Status</th>
                      <th>Admin Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRideRequests.items.map((item) => {
                      const form = rideRequestEditMap[item.rideRequestId] || toEditableRideRequest(item);
                      const sectionBusy = isSectionSaving('request', item.rideRequestId);
                      const editorOpen = isEditorOpen('request', item.rideRequestId);
                      const dirty = isFormDirty(item, form, toEditableRideRequest);
                      return (
                        <tr key={item.rideRequestId}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isRowSelected('requests', item.rideRequestId)}
                              onChange={() => toggleRowSelection('requests', item.rideRequestId)}
                            />
                          </td>
                          <td>{item.rideRequestId}</td>
                          <td>{item.riderName} (#{item.riderId})</td>
                          <td>{item.origin} to {item.destination}</td>
                          <td>{item.tripDate} {item.tripTime}</td>
                          <td>{item.passengerCount}</td>
                          <td>{item.status}</td>
                          <td>
                            <div className="admin-inline-actions">
                              <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => toggleEditor('request', item.rideRequestId)}
                                disabled={sectionBusy}
                              >
                                {editorOpen ? 'Hide Editor' : 'Edit'}
                              </button>
                              {editorOpen ? (
                                <div className="admin-inline-form">
                                  <input
                                    type="text"
                                    placeholder="Origin"
                                    value={form.origin}
                                    onChange={(event) => updateRideRequestEditField(item.rideRequestId, 'origin', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Destination"
                                    value={form.destination}
                                    onChange={(event) => updateRideRequestEditField(item.rideRequestId, 'destination', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <input
                                    type="date"
                                    value={form.tripDate}
                                    onChange={(event) => updateRideRequestEditField(item.rideRequestId, 'tripDate', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <input
                                    type="time"
                                    value={form.tripTime}
                                    onChange={(event) => updateRideRequestEditField(item.rideRequestId, 'tripTime', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <input
                                    type="number"
                                    min="1"
                                    value={form.passengerCount}
                                    onChange={(event) => updateRideRequestEditField(item.rideRequestId, 'passengerCount', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Notes"
                                    value={form.notes}
                                    onChange={(event) => updateRideRequestEditField(item.rideRequestId, 'notes', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <select
                                    value={form.status}
                                    onChange={(event) => updateRideRequestEditField(item.rideRequestId, 'status', event.target.value)}
                                    disabled={sectionBusy}
                                  >
                                    <option value="OPEN">OPEN</option>
                                    <option value="MATCHED">MATCHED</option>
                                    <option value="CLOSED">CLOSED</option>
                                  </select>
                                  <div className="admin-inline-toolbar">
                                    <span className={dirty ? 'admin-dirty-note is-dirty' : 'admin-dirty-note'}>
                                      {dirty ? 'Unsaved changes' : 'No changes'}
                                    </span>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => resetRideRequestEdit(item.rideRequestId)}
                                      disabled={sectionBusy || !dirty}
                                    >
                                      Reset
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => handleSaveRideRequest(item.rideRequestId)}
                                      disabled={sectionBusy || !dirty}
                                    >
                                      {sectionBusy ? 'Saving...' : 'Save'}
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRideRequests.length === 0 ? (
                      <tr>
                        <td colSpan="8">No ride requests match the current search.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
                {renderPaginationControls('requests', pagedRideRequests)}
              </div>
            </SectionCard>

            <SectionCard title="One-Off Driver Offers (Ride Request Offers)">
              <div className="admin-table-wrap">
                <div className="admin-filter-bar">
                  <input
                    type="search"
                    placeholder="Search one-off offers by id, rider, driver, status..."
                    value={sectionSearchMap.requestOffers}
                    onChange={(event) => updateSectionSearch('requestOffers', event.target.value)}
                  />
                  <span>{filteredRideRequestOffers.length}/{rideRequestOffers.length}</span>
                </div>
                <div className="admin-bulk-bar">
                  <span>{getSelectedIds('requestOffers').length} selected</span>
                  <select
                    value={bulkActionMap.requestOffersStatus}
                    onChange={(event) => updateBulkAction('requestOffersStatus', event.target.value)}
                  >
                    <option value="">Bulk one-off offer status...</option>
                    <option value="PENDING">PENDING</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleBulkRideRequestOfferStatusUpdate}
                    disabled={isSectionSaving('request-offer', 'bulk') || getSelectedIds('requestOffers').length === 0 || !bulkActionMap.requestOffersStatus}
                  >
                    {isSectionSaving('request-offer', 'bulk') ? 'Applying...' : 'Apply'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => clearSectionSelection('requestOffers')}
                    disabled={getSelectedIds('requestOffers').length === 0}
                  >
                    Clear
                  </button>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={
                            pagedRideRequestOffers.items.length > 0
                            && pagedRideRequestOffers.items.every((item) => isRowSelected('requestOffers', item.offerId))
                          }
                          onChange={() => toggleSelectPage('requestOffers', pagedRideRequestOffers.items.map((item) => item.offerId))}
                        />
                      </th>
                      <th>ID</th>
                      <th>Ride Request</th>
                      <th>Driver</th>
                      <th>Rider</th>
                      <th>Seats</th>
                      <th>Meeting Point</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Admin Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRideRequestOffers.items.map((item) => {
                      const form = rideRequestOfferEditMap[item.offerId] || toEditableRideRequestOffer(item);
                      const sectionBusy = isSectionSaving('request-offer', item.offerId);
                      const editorOpen = isEditorOpen('request-offer', item.offerId);
                      const dirty = isFormDirty(item, form, toEditableRideRequestOffer);
                      return (
                        <tr key={item.offerId}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isRowSelected('requestOffers', item.offerId)}
                              onChange={() => toggleRowSelection('requestOffers', item.offerId)}
                            />
                          </td>
                          <td>{item.offerId}</td>
                          <td>#{item.rideRequestId}</td>
                          <td>{item.driverName} (#{item.driverId})</td>
                          <td>{item.riderName} (#{item.riderId})</td>
                          <td>{item.proposedSeats}</td>
                          <td>{item.meetingPoint || '-'}</td>
                          <td>{item.status}</td>
                          <td>{item.createdAt}</td>
                          <td>
                            <div className="admin-inline-actions">
                              <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => toggleEditor('request-offer', item.offerId)}
                                disabled={sectionBusy}
                              >
                                {editorOpen ? 'Hide Editor' : 'Edit'}
                              </button>
                              {editorOpen ? (
                                <div className="admin-inline-form">
                                  <input
                                    type="number"
                                    min="1"
                                    value={form.proposedSeats}
                                    onChange={(event) => updateRideRequestOfferEditField(item.offerId, 'proposedSeats', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Meeting point"
                                    value={form.meetingPoint}
                                    onChange={(event) => updateRideRequestOfferEditField(item.offerId, 'meetingPoint', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <select
                                    value={form.status}
                                    onChange={(event) => updateRideRequestOfferEditField(item.offerId, 'status', event.target.value)}
                                    disabled={sectionBusy}
                                  >
                                    <option value="PENDING">PENDING</option>
                                    <option value="ACCEPTED">ACCEPTED</option>
                                    <option value="REJECTED">REJECTED</option>
                                  </select>
                                  <div className="admin-inline-toolbar">
                                    <span className={dirty ? 'admin-dirty-note is-dirty' : 'admin-dirty-note'}>
                                      {dirty ? 'Unsaved changes' : 'No changes'}
                                    </span>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => resetRideRequestOfferEdit(item.offerId)}
                                      disabled={sectionBusy || !dirty}
                                    >
                                      Reset
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => handleSaveRideRequestOffer(item.offerId)}
                                      disabled={sectionBusy || !dirty}
                                    >
                                      {sectionBusy ? 'Saving...' : 'Save'}
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRideRequestOffers.length === 0 ? (
                      <tr>
                        <td colSpan="10">No one-off ride request offers match the current search.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
                {renderPaginationControls('requestOffers', pagedRideRequestOffers)}
              </div>
            </SectionCard>

            <SectionCard title="All Join Requests">
              <div className="admin-table-wrap">
                  <div className="admin-filter-bar">
                    <input
                      type="search"
                      placeholder="Search join requests by id, offer, rider, status..."
                      value={sectionSearchMap.joins}
                      onChange={(event) => updateSectionSearch('joins', event.target.value)}
                    />
                    <span>{filteredJoinRequests.length}/{joinRequests.length}</span>
                  </div>
                  <div className="admin-bulk-bar">
                    <span>{getSelectedIds('joins').length} selected</span>
                    <select
                      value={bulkActionMap.joinsStatus}
                      onChange={(event) => updateBulkAction('joinsStatus', event.target.value)}
                    >
                      <option value="">Bulk join status...</option>
                      <option value="PENDING">PENDING</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleBulkJoinRequestStatusUpdate}
                      disabled={isSectionSaving('join', 'bulk') || getSelectedIds('joins').length === 0 || !bulkActionMap.joinsStatus}
                    >
                      {isSectionSaving('join', 'bulk') ? 'Applying...' : 'Apply'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => clearSectionSelection('joins')}
                      disabled={getSelectedIds('joins').length === 0}
                    >
                      Clear
                    </button>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={
                              pagedJoinRequests.items.length > 0
                              && pagedJoinRequests.items.every((item) => isRowSelected('joins', item.joinRequestId))
                            }
                            onChange={() => toggleSelectPage('joins', pagedJoinRequests.items.map((item) => item.joinRequestId))}
                          />
                        </th>
                        <th>ID</th>
                        <th>Offer ID</th>
                        <th>Rider</th>
                        <th>Seats</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Admin Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedJoinRequests.items.map((item) => {
                        const form = joinRequestEditMap[item.joinRequestId] || toEditableJoinRequest(item);
                        const sectionBusy = isSectionSaving('join', item.joinRequestId);
                        const editorOpen = isEditorOpen('join', item.joinRequestId);
                        const dirty = isFormDirty(item, form, toEditableJoinRequest);
                        return (
                          <tr key={item.joinRequestId}>
                            <td>
                              <input
                                type="checkbox"
                                checked={isRowSelected('joins', item.joinRequestId)}
                                onChange={() => toggleRowSelection('joins', item.joinRequestId)}
                              />
                            </td>
                            <td>{item.joinRequestId}</td>
                            <td>{item.rideOfferId}</td>
                            <td>{item.riderName} (#{item.riderId})</td>
                            <td>{item.requestedSeats}</td>
                            <td>{item.status}</td>
                            <td>{item.requestDateTime}</td>
                            <td>
                              <div className="admin-inline-actions">
                                <button
                                  className="btn btn-secondary"
                                  type="button"
                                  onClick={() => toggleEditor('join', item.joinRequestId)}
                                  disabled={sectionBusy}
                                >
                                  {editorOpen ? 'Hide Editor' : 'Edit'}
                                </button>
                                {editorOpen ? (
                                  <div className="admin-inline-form">
                                    <input
                                      type="number"
                                      min="1"
                                      value={form.requestedSeats}
                                      onChange={(event) => updateJoinRequestEditField(item.joinRequestId, 'requestedSeats', event.target.value)}
                                      disabled={sectionBusy}
                                    />
                                    <select
                                      value={form.status}
                                      onChange={(event) => updateJoinRequestEditField(item.joinRequestId, 'status', event.target.value)}
                                      disabled={sectionBusy}
                                    >
                                      <option value="PENDING">PENDING</option>
                                      <option value="ACCEPTED">ACCEPTED</option>
                                      <option value="REJECTED">REJECTED</option>
                                    </select>
                                    <div className="admin-inline-toolbar">
                                      <span className={dirty ? 'admin-dirty-note is-dirty' : 'admin-dirty-note'}>
                                        {dirty ? 'Unsaved changes' : 'No changes'}
                                      </span>
                                      <button
                                        className="btn btn-secondary"
                                        type="button"
                                        onClick={() => resetJoinRequestEdit(item.joinRequestId)}
                                        disabled={sectionBusy || !dirty}
                                      >
                                        Reset
                                      </button>
                                      <button
                                        className="btn btn-secondary"
                                        type="button"
                                        onClick={() => handleSaveJoinRequest(item.joinRequestId)}
                                        disabled={sectionBusy || !dirty}
                                      >
                                        {sectionBusy ? 'Saving...' : 'Save'}
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredJoinRequests.length === 0 ? (
                        <tr>
                          <td colSpan="8">No join requests match the current search.</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                  {renderPaginationControls('joins', pagedJoinRequests)}
              </div>
            </SectionCard>

            <SectionCard title="All Ride Matches">
              <div className="admin-table-wrap">
                  <div className="admin-filter-bar">
                    <input
                      type="search"
                      placeholder="Search matches by id, rider, driver, status..."
                      value={sectionSearchMap.matches}
                      onChange={(event) => updateSectionSearch('matches', event.target.value)}
                    />
                    <span>{filteredRideMatches.length}/{rideMatches.length}</span>
                  </div>
                  <div className="admin-bulk-bar">
                    <span>{getSelectedIds('matches').length} selected</span>
                    <select
                      value={bulkActionMap.matchesStatus}
                      onChange={(event) => updateBulkAction('matchesStatus', event.target.value)}
                    >
                      <option value="">Bulk trip status...</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleBulkRideMatchStatusUpdate}
                      disabled={isSectionSaving('match', 'bulk') || getSelectedIds('matches').length === 0 || !bulkActionMap.matchesStatus}
                    >
                      {isSectionSaving('match', 'bulk') ? 'Applying...' : 'Apply'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => clearSectionSelection('matches')}
                      disabled={getSelectedIds('matches').length === 0}
                    >
                      Clear
                    </button>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={
                              pagedRideMatches.items.length > 0
                              && pagedRideMatches.items.every((item) => isRowSelected('matches', item.rideMatchId))
                            }
                            onChange={() => toggleSelectPage('matches', pagedRideMatches.items.map((item) => item.rideMatchId))}
                          />
                        </th>
                        <th>ID</th>
                        <th>Driver</th>
                        <th>Rider</th>
                        <th>Offer/Request</th>
                        <th>Accepted Source</th>
                        <th>Meeting Point</th>
                        <th>Status</th>
                        <th>Admin Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRideMatches.items.map((item) => {
                        const form = rideMatchEditMap[item.rideMatchId] || toEditableRideMatch(item);
                        const sectionBusy = isSectionSaving('match', item.rideMatchId);
                        const editorOpen = isEditorOpen('match', item.rideMatchId);
                        const dirty = isFormDirty(item, form, toEditableRideMatch);
                        return (
                          <tr key={item.rideMatchId}>
                            <td>
                              <input
                                type="checkbox"
                                checked={isRowSelected('matches', item.rideMatchId)}
                                onChange={() => toggleRowSelection('matches', item.rideMatchId)}
                              />
                            </td>
                            <td>{item.rideMatchId}</td>
                            <td>{item.driverName} (#{item.driverId})</td>
                            <td>{item.riderName} (#{item.riderId})</td>
                            <td>
                              Offer #{item.rideOfferId || '-'} / Request #{item.rideRequestId || '-'}
                            </td>
                            <td>
                              Join #{item.acceptedJoinRequestId || '-'} / OneOffOffer #{item.acceptedRideRequestOfferId || '-'}
                            </td>
                            <td>{item.meetingPoint || '-'}</td>
                            <td>{item.tripStatus}</td>
                            <td>
                              <div className="admin-inline-actions">
                                <button
                                  className="btn btn-secondary"
                                  type="button"
                                  onClick={() => toggleEditor('match', item.rideMatchId)}
                                  disabled={sectionBusy}
                                >
                                  {editorOpen ? 'Hide Editor' : 'Edit'}
                                </button>
                                {editorOpen ? (
                                  <div className="admin-inline-form">
                                    <input
                                      type="text"
                                      placeholder="Meeting point"
                                      value={form.meetingPoint}
                                      onChange={(event) => updateRideMatchEditField(item.rideMatchId, 'meetingPoint', event.target.value)}
                                      disabled={sectionBusy}
                                    />
                                    <select
                                      value={form.tripStatus}
                                      onChange={(event) => updateRideMatchEditField(item.rideMatchId, 'tripStatus', event.target.value)}
                                      disabled={sectionBusy}
                                    >
                                      <option value="CONFIRMED">CONFIRMED</option>
                                      <option value="COMPLETED">COMPLETED</option>
                                      <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                    <div className="admin-inline-toolbar">
                                      <span className={dirty ? 'admin-dirty-note is-dirty' : 'admin-dirty-note'}>
                                        {dirty ? 'Unsaved changes' : 'No changes'}
                                      </span>
                                      <button
                                        className="btn btn-secondary"
                                        type="button"
                                        onClick={() => resetRideMatchEdit(item.rideMatchId)}
                                        disabled={sectionBusy || !dirty}
                                      >
                                        Reset
                                      </button>
                                      <button
                                        className="btn btn-secondary"
                                        type="button"
                                        onClick={() => handleSaveRideMatch(item.rideMatchId)}
                                        disabled={sectionBusy || !dirty}
                                      >
                                        {sectionBusy ? 'Saving...' : 'Save'}
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredRideMatches.length === 0 ? (
                        <tr>
                          <td colSpan="9">No ride matches match the current search.</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                  {renderPaginationControls('matches', pagedRideMatches)}
              </div>
            </SectionCard>

            <SectionCard title="Ratings and Trust Records">
              <div className="admin-table-wrap">
                <div className="admin-filter-bar">
                  <input
                    type="search"
                    placeholder="Search ratings by id, target, rater, comment..."
                    value={sectionSearchMap.ratings}
                    onChange={(event) => updateSectionSearch('ratings', event.target.value)}
                  />
                  <span>{filteredRatings.length}/{ratings.length}</span>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Target User</th>
                      <th>Rater User</th>
                      <th>Score</th>
                      <th>Comment</th>
                      <th>Created Date</th>
                      <th>Admin Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRatings.items.map((item) => {
                      const form = ratingEditMap[item.ratingId] || toEditableRating(item);
                      const sectionBusy = isSectionSaving('rating', item.ratingId);
                      const editorOpen = isEditorOpen('rating', item.ratingId);
                      const dirty = isFormDirty(item, form, toEditableRating);
                      return (
                        <tr key={item.ratingId}>
                          <td>{item.ratingId}</td>
                          <td>{item.targetUserName} (#{item.targetUserId})</td>
                          <td>{item.raterUserName} (#{item.raterUserId})</td>
                          <td>{item.score}</td>
                          <td>{item.comment || '-'}</td>
                          <td>{item.createdDate}</td>
                          <td>
                            <div className="admin-inline-actions">
                              <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => toggleEditor('rating', item.ratingId)}
                                disabled={sectionBusy}
                              >
                                {editorOpen ? 'Hide Editor' : 'Edit'}
                              </button>
                              {editorOpen ? (
                                <div className="admin-inline-form">
                                  <input
                                    type="number"
                                    min="1"
                                    value={form.raterUserId}
                                    onChange={(event) => updateRatingEditField(item.ratingId, 'raterUserId', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={form.score}
                                    onChange={(event) => updateRatingEditField(item.ratingId, 'score', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Comment"
                                    value={form.comment}
                                    onChange={(event) => updateRatingEditField(item.ratingId, 'comment', event.target.value)}
                                    disabled={sectionBusy}
                                  />
                                  <div className="admin-inline-toolbar">
                                    <span className={dirty ? 'admin-dirty-note is-dirty' : 'admin-dirty-note'}>
                                      {dirty ? 'Unsaved changes' : 'No changes'}
                                    </span>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => resetRatingEdit(item.ratingId)}
                                      disabled={sectionBusy || !dirty}
                                    >
                                      Reset
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => handleSaveRating(item.ratingId)}
                                      disabled={sectionBusy || !dirty}
                                    >
                                      {sectionBusy ? 'Saving...' : 'Save'}
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRatings.length === 0 ? (
                      <tr>
                        <td colSpan="7">No ratings match the current search.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
                {renderPaginationControls('ratings', pagedRatings)}
              </div>
            </SectionCard>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default AdminDashboardPage;

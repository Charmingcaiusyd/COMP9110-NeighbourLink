import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAdminJoinRequests,
  getAdminOverview,
  getAdminRideMatches,
  getAdminRideOffers,
  getAdminRideRequests,
  getAdminUsers,
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
    riderPreferredTravelTimes: user.riderPreferredTravelTimes || '',
    riderUsualDestinations: user.riderUsualDestinations || '',
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
  const [joinRequests, setJoinRequests] = useState([]);
  const [rideMatches, setRideMatches] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const adminSessionKey = session?.adminSessionKey || '';

  const selectedUser = useMemo(
    () => users.find((user) => user.userId === selectedUserId) || null,
    [selectedUserId, users],
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
      getAdminJoinRequests(adminSessionKey),
      getAdminRideMatches(adminSessionKey),
    ])
      .then(([overviewData, userData, offerData, requestData, joinData, matchData]) => {
        if (!active) {
          return;
        }
        setOverview(overviewData || null);
        setUsers(Array.isArray(userData) ? userData : []);
        setRideOffers(Array.isArray(offerData) ? offerData : []);
        setRideRequests(Array.isArray(requestData) ? requestData : []);
        setJoinRequests(Array.isArray(joinData) ? joinData : []);
        setRideMatches(Array.isArray(matchData) ? matchData : []);
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError.message || 'Unable to load admin dashboard data.');
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
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Role</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.userId} className={user.userId === selectedUserId ? 'is-selected' : ''}>
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
                    </tbody>
                  </table>
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
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Driver</th>
                      <th>Route</th>
                      <th>Date/Time</th>
                      <th>Seats</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rideOffers.map((item) => (
                      <tr key={item.offerId}>
                        <td>{item.offerId}</td>
                        <td>{item.driverName} (#{item.driverId})</td>
                        <td>{item.origin} to {item.destination}</td>
                        <td>{item.departureDate} {item.departureTime}</td>
                        <td>{item.availableSeats}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="All Ride Requests">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Rider</th>
                      <th>Route</th>
                      <th>Date/Time</th>
                      <th>Passengers</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rideRequests.map((item) => (
                      <tr key={item.rideRequestId}>
                        <td>{item.rideRequestId}</td>
                        <td>{item.riderName} (#{item.riderId})</td>
                        <td>{item.origin} to {item.destination}</td>
                        <td>{item.tripDate} {item.tripTime}</td>
                        <td>{item.passengerCount}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="All Join Requests and Matches">
              <div className="admin-two-column">
                <div className="admin-table-wrap">
                  <h3>Join Requests</h3>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Offer ID</th>
                        <th>Rider</th>
                        <th>Seats</th>
                        <th>Status</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {joinRequests.map((item) => (
                        <tr key={item.joinRequestId}>
                          <td>{item.joinRequestId}</td>
                          <td>{item.rideOfferId}</td>
                          <td>{item.riderName} (#{item.riderId})</td>
                          <td>{item.requestedSeats}</td>
                          <td>{item.status}</td>
                          <td>{item.requestDateTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="admin-table-wrap">
                  <h3>Ride Matches</h3>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Driver</th>
                        <th>Rider</th>
                        <th>Offer/Request</th>
                        <th>Meeting Point</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rideMatches.map((item) => (
                        <tr key={item.rideMatchId}>
                          <td>{item.rideMatchId}</td>
                          <td>{item.driverName} (#{item.driverId})</td>
                          <td>{item.riderName} (#{item.riderId})</td>
                          <td>
                            Offer #{item.rideOfferId || '-'} / Request #{item.rideRequestId || '-'}
                          </td>
                          <td>{item.meetingPoint || '-'}</td>
                          <td>{item.tripStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </SectionCard>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default AdminDashboardPage;

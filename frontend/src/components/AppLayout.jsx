import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

function AppLayout() {
  const { session, role, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="nav-row">
          <Link className="brand" to="/">
            <span className="brand-mark">NL</span>
            <span className="brand-text">
              <strong>NeighbourLink</strong>
              Community Rides
            </span>
          </Link>
          <nav>
            <Link className="nav-link" to="/intro">Intro</Link>
            <Link to="/">Find a Ride</Link>
            <Link to="/post-ride-request">Post a Request</Link>
            <Link to="/my-trips">My Trips</Link>
            <Link to="/profile">Profile</Link>
            {role === 'DRIVER' ? <Link to="/driver-hub">Driver Hub</Link> : null}
            <button className="btn btn-secondary nav-btn" type="button" onClick={logout}>
              Log Out
            </button>
          </nav>
        </div>
        <p className="nav-user">
          Signed in as <strong>{session?.fullName}</strong> ({session?.role})
        </p>
      </header>
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;

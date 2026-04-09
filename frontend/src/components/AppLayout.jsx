import { useEffect, useRef, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

function AppLayout() {
  const { session, role, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navActionsRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (!navActionsRef.current?.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  function navLinkClassName({ isActive }) {
    return `nav-link${isActive ? ' is-active' : ''}`;
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="nav-row">
          <Link className="brand" to="/" onClick={() => setMobileMenuOpen(false)}>
            <span className="brand-mark">NL</span>
            <span className="brand-text">
              <strong>NeighbourLink</strong>
              <span className="brand-subtitle">Community Rides</span>
            </span>
          </Link>

          <div className="nav-actions" ref={navActionsRef}>
            <button
              className="nav-toggle"
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="app-nav"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? 'Close Menu' : 'Menu'}
            </button>

            <nav
              id="app-nav"
              className={`app-nav ${mobileMenuOpen ? 'is-open' : ''}`}
              aria-label="Primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <NavLink className={navLinkClassName} to="/intro">Intro</NavLink>
              <NavLink className={navLinkClassName} to="/tutorial">Tutorial</NavLink>
              <NavLink end className={navLinkClassName} to="/">Find a Ride</NavLink>
              <NavLink className={navLinkClassName} to="/post-ride-request">Post a Request</NavLink>
              <NavLink className={navLinkClassName} to="/my-trips">My Trips</NavLink>
              <NavLink className={navLinkClassName} to="/profile">Profile</NavLink>
              {role === 'DRIVER' ? <NavLink className={navLinkClassName} to="/driver-hub">Driver Hub</NavLink> : null}
              <button className="btn btn-secondary nav-btn" type="button" onClick={logout}>
                Log Out
              </button>
            </nav>
          </div>
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

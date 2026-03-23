import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const FIXED_ADMIN_EMAIL = 'admin@neighbourlink.local';
const FIXED_ADMIN_PASSWORD = 'admin12345';

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    role,
    loginWithPassword,
    logout,
  } = useAuth();

  const [email, setEmail] = useState(FIXED_ADMIN_EMAIL);
  const [password, setPassword] = useState(FIXED_ADMIN_PASSWORD);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    if (role === 'ADMIN') {
      navigate('/admin', { replace: true });
      return;
    }
    navigate('/', { replace: true });
  }, [isAuthenticated, navigate, role]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const authResponse = await loginWithPassword(email.trim(), password);
      if (authResponse?.role !== 'ADMIN') {
        logout();
        setError('This portal only accepts the fixed admin account.');
        return;
      }
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in as admin right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-top">
          <div>
            <h1>Admin Portal</h1>
            <p className="auth-subtitle">Fixed-account admin login for NeighbourLink operations.</p>
          </div>
          <Link className="btn btn-secondary" to="/intro">View Intro</Link>
        </div>

        <p className="auth-hint">
          Fixed admin credentials: `{FIXED_ADMIN_EMAIL}` / `{FIXED_ADMIN_PASSWORD}`
        </p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Admin email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
            />
          </label>
          <label>
            Admin password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
            />
          </label>
          {error ? <p className="status-error">{error}</p> : null}
          <div className="form-actions">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Open Admin Dashboard'}
            </button>
            <Link className="btn btn-secondary" to="/login">Back to User Login</Link>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AdminLoginPage;

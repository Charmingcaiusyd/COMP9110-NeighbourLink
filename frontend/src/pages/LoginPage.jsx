import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loginWithPassword, loginWithSocial } = useAuth();
  const [email, setEmail] = useState('maria.rider@example.com');
  const [password, setPassword] = useState('demo1234');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginWithPassword(email.trim(), password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in right now.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSocialLogin(provider) {
    setError('');
    setSubmitting(true);
    try {
      await loginWithSocial(provider, 'RIDER');
      navigate('/', { replace: true });
    } catch (loginError) {
      setError(loginError.message || `Unable to sign in with ${provider}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-top">
          <div>
            <h1>NeighbourLink</h1>
            <p className="auth-subtitle">Welcome back. Sign in to continue your community rides.</p>
          </div>
          <Link className="btn btn-secondary" to="/intro">View Intro</Link>
        </div>
        <p className="auth-hint">Demo login: `maria.rider@example.com` / `demo1234`</p>
        <form className="form-grid" onSubmit={handleLogin}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
            />
          </label>
          <label>
            Password
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
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
            <Link className="btn btn-secondary" to="/register">Create Account</Link>
          </div>
        </form>
        <div className="auth-divider">or continue with</div>
        <div className="form-actions">
          <button className="btn btn-secondary" type="button" disabled={submitting} onClick={() => handleSocialLogin('GOOGLE')}>
            Continue with Google
          </button>
          <button className="btn btn-secondary" type="button" disabled={submitting} onClick={() => handleSocialLogin('APPLE')}>
            Continue with Apple
          </button>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;

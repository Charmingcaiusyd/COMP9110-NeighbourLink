import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, registerAccount } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'RIDER',
    phone: '',
    suburb: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please complete full name, email, and password.');
      return;
    }

    setSubmitting(true);
    try {
      await registerAccount({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phone: form.phone.trim() || null,
        suburb: form.suburb.trim() || null,
      });
      navigate('/', { replace: true });
    } catch (registerError) {
      setError(registerError.message || 'Unable to register right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-top">
          <div>
            <h1>Create Your Account</h1>
            <p className="auth-subtitle">Join your local ride network in under a minute.</p>
          </div>
          <Link className="btn btn-secondary" to="/intro">View Intro</Link>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              value={form.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              disabled={submitting}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              disabled={submitting}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              disabled={submitting}
            />
          </label>
          <label>
            Role
            <select
              value={form.role}
              onChange={(event) => updateField('role', event.target.value)}
              disabled={submitting}
            >
              <option value="RIDER">Rider</option>
              <option value="DRIVER">Driver</option>
            </select>
          </label>
          <label>
            Phone (optional)
            <input
              type="text"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              disabled={submitting}
            />
          </label>
          <label>
            Suburb (optional)
            <input
              type="text"
              value={form.suburb}
              onChange={(event) => updateField('suburb', event.target.value)}
              disabled={submitting}
            />
          </label>
          {error ? <p className="status-error">{error}</p> : null}
          <div className="form-actions">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
            <Link className="btn btn-secondary" to="/login">Back to Login</Link>
          </div>
        </form>
      </section>
    </div>
  );
}

export default RegisterPage;

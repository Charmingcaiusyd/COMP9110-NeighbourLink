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
    driverVehicleInfo: '',
    driverSpareSeatCapacity: '1',
  });
  const [driverFiles, setDriverFiles] = useState({
    driverLicenceFile: null,
    spareSeatCapacityProofFile: null,
    vehicleRegoFile: null,
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

  function updateDriverFile(name, file) {
    setDriverFiles((prev) => ({
      ...prev,
      [name]: file || null,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please complete full name, email, and password.');
      return;
    }
    if (form.role === 'DRIVER') {
      if (!form.driverVehicleInfo.trim()) {
        setError('Driver vehicle info is required.');
        return;
      }
      const seatCapacity = Number(form.driverSpareSeatCapacity);
      if (!Number.isInteger(seatCapacity) || seatCapacity < 1) {
        setError('Driver spare seat capacity must be a whole number >= 1.');
        return;
      }
      if (!driverFiles.driverLicenceFile || !driverFiles.spareSeatCapacityProofFile || !driverFiles.vehicleRegoFile) {
        setError('Driver registration requires licence, spare seat proof, and vehicle rego files.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phone: form.phone.trim() || null,
        suburb: form.suburb.trim() || null,
        driverVehicleInfo: form.role === 'DRIVER' ? form.driverVehicleInfo.trim() : null,
        driverSpareSeatCapacity: form.role === 'DRIVER' ? Number(form.driverSpareSeatCapacity) : null,
      };
      if (form.role === 'DRIVER') {
        const multipartPayload = new FormData();
        multipartPayload.append(
          'payload',
          new Blob([JSON.stringify(payload)], { type: 'application/json' }),
        );
        multipartPayload.append('driverLicenceFile', driverFiles.driverLicenceFile);
        multipartPayload.append('spareSeatCapacityProofFile', driverFiles.spareSeatCapacityProofFile);
        multipartPayload.append('vehicleRegoFile', driverFiles.vehicleRegoFile);
        await registerAccount(multipartPayload);
      } else {
        await registerAccount(payload);
      }
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
          {form.role === 'DRIVER' ? (
            <>
              <label>
                Vehicle info
                <input
                  type="text"
                  value={form.driverVehicleInfo}
                  onChange={(event) => updateField('driverVehicleInfo', event.target.value)}
                  disabled={submitting}
                />
              </label>
              <label>
                Spare seat capacity
                <input
                  type="number"
                  min="1"
                  value={form.driverSpareSeatCapacity}
                  onChange={(event) => updateField('driverSpareSeatCapacity', event.target.value)}
                  disabled={submitting}
                />
              </label>
              <label>
                Driver licence file (PDF/JPG/PNG)
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => updateDriverFile('driverLicenceFile', event.target.files?.[0])}
                  disabled={submitting}
                />
              </label>
              <label>
                Spare seat capacity proof (PDF/JPG/PNG)
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => updateDriverFile('spareSeatCapacityProofFile', event.target.files?.[0])}
                  disabled={submitting}
                />
              </label>
              <label>
                Vehicle rego file (PDF/JPG/PNG)
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => updateDriverFile('vehicleRegoFile', event.target.files?.[0])}
                  disabled={submitting}
                />
              </label>
            </>
          ) : null}
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

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const registerRole = document.getElementById('register-role');
  const registerName = document.getElementById('register-name');
  const registerEmail = document.getElementById('register-email');
  const registerPassword = document.getElementById('register-password');

  const knownDrivers = new Set([
    'emma.driver@example.com',
    'liam.driver@example.com',
    'sophie.driver@example.com'
  ]);

  const knownRiders = new Set([
    'daniel.rider@example.com',
    'maria.rider@example.com',
    'olivia.rider@example.com'
  ]);

  function resolveRoleFromEmail(email) {
    const normalized = (email || '').trim().toLowerCase();
    if (knownDrivers.has(normalized)) {
      return 'driver';
    }
    if (knownRiders.has(normalized)) {
      return 'rider';
    }
    if (normalized.includes('driver')) {
      return 'driver';
    }
    return 'rider';
  }

  function buildTarget(role, payload = {}) {
    const page = role === 'driver' ? './driver-hub.html' : './find-a-ride.html';
    const params = new URLSearchParams();

    Object.entries(payload).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      }
    });

    params.set('role', role);
    return `${page}?${params.toString()}`;
  }

  function syncRegisterDefaults() {
    if (!registerRole || !registerName || !registerEmail || !registerPassword) {
      return;
    }

    if (registerRole.value === 'driver') {
      if (!registerName.value || registerName.value === 'Olivia Chen') {
        registerName.value = 'Sophie Driver';
      }
      if (!registerEmail.value || registerEmail.value === 'olivia.rider@example.com') {
        registerEmail.value = 'sophie.driver@example.com';
      }
      if (!registerPassword.value || registerPassword.value === 'demo1234') {
        registerPassword.value = 'demo1234';
      }
    } else {
      if (!registerName.value || registerName.value === 'Sophie Driver') {
        registerName.value = 'Olivia Chen';
      }
      if (!registerEmail.value || registerEmail.value === 'sophie.driver@example.com') {
        registerEmail.value = 'olivia.rider@example.com';
      }
      if (!registerPassword.value) {
        registerPassword.value = 'demo1234';
      }
    }
  }

  if (registerRole) {
    registerRole.addEventListener('change', syncRegisterDefaults);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const email = String(formData.get('email') || '').trim();
      const role = resolveRoleFromEmail(email);
      const name = role === 'driver' ? 'Demo Driver' : 'Demo Rider';
      window.location.href = buildTarget(role, { email, name });
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(registerForm);
      const role = String(formData.get('role') || 'rider').toLowerCase();
      const payload = {
        email: String(formData.get('email') || '').trim(),
        name: String(formData.get('name') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        suburb: String(formData.get('suburb') || '').trim()
      };
      window.location.href = buildTarget(role === 'driver' ? 'driver' : 'rider', payload);
    });
  }
});

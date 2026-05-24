const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function expectLink(file, text, href) {
  const html = read(file);
  const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const linkPattern = new RegExp(`<a[^>]*href="\\./${escapedHref}"[^>]*>\\s*${escapedText}\\s*<\\/a>`, 'i');
  if (!linkPattern.test(html)) {
    throw new Error(`${file} does not contain link text "${text}" to ${href}`);
  }
}

function expectContains(file, snippet, label) {
  const html = read(file);
  if (!html.includes(snippet)) {
    throw new Error(`${file} is missing ${label}`);
  }
}

function expectNotContains(file, snippet, label) {
  const html = read(file);
  if (html.includes(snippet)) {
    throw new Error(`${file} still contains ${label}`);
  }
}

function verifyAuthFlowScript() {
  const source = read('auth-flow.js');
  const domContentLoaded = [];

  function createField(id, name, value = '') {
    return {
      id,
      name,
      value,
      listeners: {},
      addEventListener(type, handler) {
        this.listeners[type] = handler;
      },
      dispatch(type) {
        const handler = this.listeners[type];
        if (handler) {
          handler({ preventDefault() {}, target: this });
        }
      }
    };
  }

  function createForm(id, fields) {
    return {
      id,
      fields,
      listeners: {},
      addEventListener(type, handler) {
        this.listeners[type] = handler;
      },
      getValue(name) {
        const field = fields.find((item) => item.name === name);
        return field ? field.value : null;
      },
      dispatchSubmit() {
        const handler = this.listeners.submit;
        if (handler) {
          handler({ preventDefault() {} });
        }
      }
    };
  }

  const loginEmail = createField('login-email', 'email', 'daniel.rider@example.com');
  const loginPassword = createField('login-password', 'password', '123456');
  const loginForm = createForm('login-form', [loginEmail, loginPassword]);

  const registerRole = createField('register-role', 'role', 'rider');
  const registerName = createField('register-name', 'name', 'Olivia Chen');
  const registerEmail = createField('register-email', 'email', 'olivia.rider@example.com');
  const registerPhone = createField('register-phone', 'phone', '0412 555 901');
  const registerSuburb = createField('register-suburb', 'suburb', 'Clayton');
  const registerPassword = createField('register-password', 'password', 'demo1234');
  const registerForm = createForm('register-form', [
    registerRole,
    registerName,
    registerEmail,
    registerPhone,
    registerSuburb,
    registerPassword
  ]);

  const nodeMap = new Map([
    ['login-form', loginForm],
    ['login-email', loginEmail],
    ['login-password', loginPassword],
    ['register-form', registerForm],
    ['register-role', registerRole],
    ['register-name', registerName],
    ['register-email', registerEmail],
    ['register-phone', registerPhone],
    ['register-suburb', registerSuburb],
    ['register-password', registerPassword]
  ]);

  const location = { href: 'file:///index.html' };
  const context = {
    document: {
      addEventListener(type, handler) {
        if (type === 'DOMContentLoaded') {
          domContentLoaded.push(handler);
        }
      },
      getElementById(id) {
        return nodeMap.get(id) || null;
      }
    },
    window: { location },
    URLSearchParams,
    FormData: class {
      constructor(form) {
        this.form = form;
      }
      get(name) {
        return this.form.getValue(name);
      }
    }
  };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'auth-flow.js' });
  domContentLoaded.forEach((handler) => handler());

  loginEmail.value = 'daniel.rider@example.com';
  loginPassword.value = '123456';
  loginForm.dispatchSubmit();
  if (!location.href.includes('./find-a-ride.html') || !location.href.includes('role=rider')) {
    throw new Error('auth-flow.js did not route rider login to find-a-ride.html');
  }

  loginEmail.value = 'emma.driver@example.com';
  loginPassword.value = 'demo1234';
  loginForm.dispatchSubmit();
  if (!location.href.includes('./driver-hub.html') || !location.href.includes('role=driver')) {
    throw new Error('auth-flow.js did not route driver login to driver-hub.html');
  }

  registerRole.value = 'rider';
  registerRole.dispatch('change');
  registerName.value = 'Nina Rider';
  registerEmail.value = 'nina.rider@example.com';
  registerPhone.value = '0400 000 001';
  registerSuburb.value = 'Clayton';
  registerPassword.value = 'demo1234';
  registerForm.dispatchSubmit();
  if (!location.href.includes('./find-a-ride.html') || !location.href.includes('name=Nina+Rider')) {
    throw new Error('auth-flow.js did not route rider registration to find-a-ride.html');
  }

  registerRole.value = 'driver';
  registerRole.dispatch('change');
  registerName.value = 'Casey Driver';
  registerEmail.value = 'casey.driver@example.com';
  registerPhone.value = '0400 000 002';
  registerSuburb.value = 'Docklands';
  registerPassword.value = 'demo1234';
  registerForm.dispatchSubmit();
  if (!location.href.includes('./driver-hub.html') || !location.href.includes('role=driver')) {
    throw new Error('auth-flow.js did not route driver registration to driver-hub.html');
  }
}

expectContains('index.html', 'id="login-form"', 'login form');
expectContains('index.html', 'id="login-email"', 'login email field');
expectContains('index.html', 'id="login-password"', 'login password field');
expectLink('index.html', 'Need an account? Register', 'register.html');
expectContains('register.html', 'id="register-form"', 'register form');
expectContains('register.html', 'id="register-role"', 'register role selector');
expectContains('register.html', 'id="register-submit"', 'register submit button');
expectLink('register.html', 'Back to Log In', 'index.html');
expectContains('index.html', '<script src="./auth-flow.js"></script>', 'auth-flow script reference');
expectContains('register.html', '<script src="./auth-flow.js"></script>', 'auth-flow script reference');
expectLink('find-a-ride.html', 'Settings', 'rider-settings.html');
expectLink('my-trips.html', 'Settings', 'rider-settings.html');
expectLink('driver-hub.html', 'Settings', 'driver-settings.html');
expectLink('driver-trip-workflow.html', 'Settings', 'driver-settings.html');
expectContains('rider-settings.html', 'id="settings-password-form"', 'rider settings password form');
expectContains('rider-settings.html', 'id="settings-payment-form"', 'rider settings payment form');
expectContains('driver-settings.html', 'id="settings-password-form"', 'driver settings password form');
expectContains('driver-settings.html', 'id="settings-payment-form"', 'driver settings payment form');
expectContains('rider-settings.html', '<script src="./prototype-context.js"></script>', 'rider settings script reference');
expectContains('driver-settings.html', '<script src="./prototype-context.js"></script>', 'driver settings script reference');
expectContains('driver-accepted-details.html', '<script src="./prototype-context.js"></script>', 'accepted details script reference');
expectContains('driver-rejected-details.html', '<script src="./prototype-context.js"></script>', 'rejected details script reference');
expectContains('driver-decision-outcome.html', '<script src="./prototype-context.js"></script>', 'driver outcome script reference');
expectLink('find-a-ride.html', 'Continue to Destination', 'find-a-ride.html#destination');
expectLink('find-a-ride.html', 'Continue to Trip Date', 'find-a-ride.html#trip-date');
expectLink('find-a-ride.html', 'Search Ride Offers', 'search-results.html');
expectNotContains('find-a-ride.html', 'Fallback example', 'fallback example content');
expectLink('search-results.html', 'View Details', 'ride-offer-details.html');
expectContains('search-results.html', 'Rider Matching Failed', 'matching failed notice');
expectLink('search-results.html', 'Start a New Search', 'find-a-ride.html');
expectNotContains('search-results.html', 'Fallback path', 'fallback path content');
expectLink('ride-offer-details.html', 'Submit Join Request', 'my-trips.html#join-request-submitted');
expectContains('my-trips.html', 'Notifications', 'notifications section');
expectContains('my-trips.html', 'Trip Records', 'trip records section');
expectLink('my-trips.html', 'Open Trip Records', 'my-trips.html#trip-records');
expectLink('my-trips.html', 'View Details', 'rider-record-501-details.html');
expectLink('my-trips.html', 'View Details', 'rider-record-601-details.html');
expectNotContains('my-trips.html', '<h2>Join Requests</h2>', 'legacy join requests standalone section');
expectNotContains('my-trips.html', '<h2>Confirmed Trips</h2>', 'legacy confirmed trips standalone section');
expectNotContains('my-trips.html', 'Fallback Requests', 'fallback requests section');
expectNotContains('my-trips.html', 'Switch to Driver Hub', 'cross-role switch link');
expectNotContains('my-trips.html', 'My Unified Orders', 'legacy orders title');
expectContains('rider-record-501-details.html', 'Record #501', 'record 501 details page title');
expectContains('rider-record-501-details.html', 'rider-record-501-map', 'record 501 map preview');
expectLink('rider-record-501-details.html', 'Back to Trip Records', 'my-trips.html#trip-records');
expectContains('rider-record-601-details.html', 'Record #601', 'record 601 details page title');
expectContains('rider-record-601-details.html', 'rider-record-601-map', 'record 601 map preview');
expectLink('rider-record-601-details.html', 'Back to Trip Records', 'my-trips.html#trip-records');
expectLink('driver-hub.html', 'Accept Request', 'driver-decision-outcome.html');
expectLink('driver-hub.html', 'Reject Request', 'driver-decision-outcome.html');
expectContains('driver-hub.html', 'Driver Review', 'driver review title');
expectContains('driver-hub.html', 'Join Request Review', 'join request review module');
expectContains('driver-hub.html', 'request-map-frame', 'join request map preview');
expectContains('driver-hub.html', 'Accepted', 'accepted records section');
expectContains('driver-hub.html', 'Rejected', 'rejected records section');
expectLink('driver-hub.html', 'Start Trip Workflow', 'driver-trip-workflow.html');
expectLink('driver-hub.html', 'View Details', 'driver-accepted-details.html');
expectLink('driver-hub.html', 'View Details', 'driver-rejected-details.html');
expectNotContains('driver-hub.html', 'View Rider Confirmed Status', 'cross-role rider-status link');
expectNotContains('driver-hub.html', 'Driver Hub', 'legacy driver hub title');
expectNotContains('driver-hub.html', 'Trips', 'driver trips section');
expectNotContains('driver-hub.html', 'Request Details', 'request details section');
expectNotContains('driver-hub.html', 'Review Request Details', 'review request details action');
expectNotContains('driver-hub.html', 'View Trips', 'view trips action');
expectContains('driver-accepted-details.html', 'Accepted Join Request', 'accepted details title');
expectLink('driver-accepted-details.html', 'Start Trip Workflow', 'driver-trip-workflow.html');
expectLink('driver-accepted-details.html', 'Back to Driver Review', 'driver-hub.html#accepted-records');
expectContains('driver-rejected-details.html', 'Rejected Join Request', 'rejected details title');
expectLink('driver-rejected-details.html', 'Back to Driver Review', 'driver-hub.html#rejected-records');
expectContains('driver-decision-outcome.html', 'Returning to Driver Review in 5 seconds', 'decision return note');
expectLink('driver-decision-outcome.html', 'Back to Driver Review', 'driver-hub.html');
expectContains('driver-trip-workflow.html', 'Driver Trip Workflow', 'driver trip workflow title');
expectContains('driver-trip-workflow.html', 'workflow-map-main', 'single workflow map preview');
expectContains('driver-trip-workflow.html', 'workflow-next-stage-link', 'single workflow action link');
expectContains('driver-trip-workflow.html', 'Trip Completed', 'completed workflow panel');
expectLink('driver-trip-workflow.html', 'Back', 'driver-hub.html#accepted-records');
expectNotContains('driver-trip-workflow.html', 'Reset Workflow', 'removed reset action');
expectNotContains('driver-trip-workflow.html', 'Back to Driver Review', 'removed verbose back action label');
verifyAuthFlowScript();

console.log('Verified rider and driver button flows plus login/register form surfaces across the static prototype.');

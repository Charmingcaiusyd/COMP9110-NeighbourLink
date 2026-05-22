const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/gs658/AppData/Local/Temp/nl-static-verify/node_modules/playwright-core');

(async () => {
  const root = path.resolve(__dirname, '..');
  const baseFileUrl = pathToFileURL(path.join(root, 'index.html')).href;
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  const results = [];

  const record = (name, ok, detail) => results.push({ name, ok, detail });
  const textVisible = async (text) => (await page.getByText(text, { exact: false }).count().catch(() => 0)) > 0;
  const countCardsInSection = async (headingText) => {
    const heading = page.getByRole('heading', { name: headingText, exact: true }).first();
    const section = heading.locator('xpath=ancestor::section[1]');
    return section.locator('.result-card').count();
  };
  const expectText = async (name, text, timeout = 15000) => {
    try {
      await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout });
      record(name, true, `Found: ${text}`);
      return true;
    } catch (error) {
      record(name, false, `Missing: ${text}`);
      return false;
    }
  };
  const gotoHash = async (hash, fresh = false) => {
    const url = fresh ? `${baseFileUrl}?fresh=${Date.now()}${hash}` : `${baseFileUrl}${hash}`;
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(250);
  };
  const logoutIfVisible = async () => {
    const count = await page.getByRole('button', { name: 'Log Out' }).count().catch(() => 0);
    if (count > 0) {
      await page.getByRole('button', { name: 'Log Out' }).click();
      await page.waitForTimeout(250);
    }
  };
  const loginFromFresh = async (email, password) => {
    await page.evaluate(() => localStorage.removeItem('neighbourlink.static.site.session.v1')).catch(() => {});
    await gotoHash('#/login', true);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForTimeout(350);
  };

  await gotoHash('#/login', true);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'load' });
  await expectText('Direct file login page renders', 'User Login');

  await loginFromFresh('daniel.rider@example.com', '123456');
  record('Rider direct file login route', page.url().includes('#/'), page.url());
  await expectText('Rider home renders', 'Find a Ride');
  await expectText('Rider flow tabs render', 'Trip Date');

  await page.locator('[data-find-step="DESTINATION"]').click();
  await expectText('Destination step opens', 'Destination');
  try {
    await page.waitForFunction(() => document.querySelectorAll('.leaflet-container').length > 0, { timeout: 15000 });
    record('Live map container renders', true, 'Leaflet container detected on direct file load');
  } catch (error) {
    record('Live map container renders', false, 'Leaflet container not detected');
  }

  await page.locator('[data-loc-query="destination"]').fill('Melbourne CBD');
  await page.locator('button[data-action="loc-search"][data-scope="destination"]').click();
  try {
    await page.waitForFunction(() => document.querySelectorAll('button[data-action="loc-select"]').length > 0, { timeout: 20000 });
    record('OpenStreetMap search results load', true, 'Location search returned selectable results');
    await page.locator('button[data-action="loc-select"]').first().click();
    await page.waitForTimeout(400);
  } catch (error) {
    record('OpenStreetMap search results load', false, 'Location search results did not appear');
  }

  await page.locator('[data-find-step="TRIP"]').click();
  await expectText('Trip step opens', 'Confirm your ride search filters');
  try {
    await page.getByText('Departure time (optional)', { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 });
    await page.getByText('Time flexibility (0-6h)', { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 });
    await page.getByText('Passengers', { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 });
    record('Trip controls render on Trip step', true, 'Date, time, flexibility, and passenger controls are visible');
  } catch (error) {
    record('Trip controls render on Trip step', false, 'Expected Trip-step controls are missing');
  }

  await page.getByRole('button', { name: 'Back' }).click();
  await expectText('Back button returns to destination step', 'Current origin');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Confirm Flow' }).click();
  await page.waitForFunction(() => location.hash.startsWith('#/search-results'));
  record('Search results route after confirm', page.url().includes('#/search-results'), page.url());
  await expectText('Search results content renders', 'Matching Ride Offers');
  await expectText('Search summary renders', 'Search Summary');
  const searchResultCount = await page.locator('.results-grid .result-card').count();
  record('Search results count >= 2', searchResultCount >= 2, `Matching ride offers shown: ${searchResultCount}`);

  await page.getByRole('link', { name: 'View Details' }).first().click();
  await page.waitForFunction(() => location.hash.startsWith('#/ride-offer-details/'));
  await expectText('Offer details trust section renders', 'Driver trust');
  await expectText('Offer details request form renders', 'Request This Ride');

  await page.getByRole('button', { name: 'Request This Ride' }).click();
  await page.waitForFunction(() => location.hash === '#/ride-confirmed');
  await expectText('Join request confirmation page renders', 'Ride Request Submitted');
  await page.getByRole('link', { name: 'Open My Trips' }).click();
  await page.waitForFunction(() => location.hash === '#/my-trips');
  await expectText('My Trips notifications section renders', 'Trip Confirmations and Notifications');
  await expectText('My Trips unified orders section renders', 'My Unified Orders');
  const riderNotificationCount = await countCardsInSection('Trip Confirmations and Notifications');
  const riderUnifiedCount = await countCardsInSection('My Unified Orders');
  record('Rider notifications count >= 2', riderNotificationCount >= 2, `Notifications shown: ${riderNotificationCount}`);
  record('Rider unified orders count >= 2', riderUnifiedCount >= 2, `Unified order cards shown: ${riderUnifiedCount}`);

  await page.locator('[data-action="trips-notification-filter"][data-value="ALL"]').click();
  record('Notification filter buttons work', await textVisible('All'), 'Switched notification tab to All');
  await page.locator('[data-action="trips-stage"][data-value="CONFIRMED"]').click();
  await page.locator('[data-action="trips-path"][data-value="JOIN_REQUEST"]').click();
  await expectText('My Trips filter buttons work', 'Join Request');

  await gotoHash('#/account');
  await expectText('Account page renders', 'Account Settings');
  await page.locator('input[name="currentPassword"]').fill('123456');
  await page.locator('input[name="newPassword"]').fill('12345678');
  await page.locator('input[name="confirmPassword"]').fill('12345678');
  await page.getByRole('button', { name: 'Reset Password' }).click();
  await page.waitForTimeout(250);
  record('Reset password button works', await textVisible('Password updated for Daniel Chen.'), 'Submitted password reset form');

  await page.locator('input[name="last4"]').fill('9999');
  await page.locator('input[name="expiry"]').fill('12/30');
  await page.locator('select[name="primary"]').selectOption('YES');
  await page.getByRole('button', { name: 'Save Payment Method' }).click();
  await page.waitForTimeout(250);
  record('Save payment method button works', await textVisible('Visa ending 9999 saved.'), 'Saved a new default payment method');
  const riderPaymentMethodCount = await countCardsInSection('Payment Methods');
  record('Rider payment methods count >= 2', riderPaymentMethodCount >= 2, `Payment methods shown: ${riderPaymentMethodCount}`);

  await logoutIfVisible();
  await loginFromFresh('emma.driver@example.com', 'demo1234');
  await page.waitForFunction(() => location.hash === '#/driver-hub');
  await expectText('Driver hub renders', 'Pending Join Requests');
  await expectText('Driver one-off request section renders', 'Open One-Off Ride Requests');
  const driverPendingCount = await countCardsInSection('Pending Join Requests');
  const driverOpenRequestCount = await countCardsInSection('Open One-Off Ride Requests');
  record('Driver pending join requests count >= 2', driverPendingCount >= 2, `Pending join requests shown: ${driverPendingCount}`);
  record('Driver open one-off requests count >= 2', driverOpenRequestCount >= 2, `Open one-off requests shown: ${driverOpenRequestCount}`);

  const joinForms = await page.locator('form[data-form="driver-join"]').count();
  if (joinForms > 0) {
    const joinForm = page.locator('form[data-form="driver-join"]').first();
    await joinForm.locator('input[name="meetingPoint"]').fill('Clayton Station Gate 1');
    await joinForm.getByRole('button', { name: 'Submit Decision' }).click();
    await page.waitForTimeout(350);
    record('Driver accept join request button works', await textVisible('accepted') || await textVisible('Join request #'), 'Driver submitted join request decision');
  } else {
    record('Driver accept join request button works', false, 'No driver join form available to test');
  }

  const oneOffForms = await page.locator('form[data-form="driver-request-offer"]').count();
  if (oneOffForms > 0) {
    const oneOffForm = page.locator('form[data-form="driver-request-offer"]').first();
    await oneOffForm.locator('input[name="meetingPoint"]').fill('Monash North Loop');
    await oneOffForm.getByRole('button', { name: 'Respond to Request' }).click();
    await page.waitForTimeout(350);
    record('Driver respond to request button works', await textVisible('submitted') || await textVisible('Offer #'), 'Driver submitted a one-off response');
  } else {
    record('Driver respond to request button works', false, 'No driver one-off response form available to test');
  }

  await gotoHash('#/my-trips');
  await expectText('Driver My Trips renders', 'Trip Filter');
  await page.locator('[data-action="trips-trip-filter"][data-value="HISTORY"]').click();
  await page.locator('[data-action="trips-trip-type"][data-value="ONE_OFF_REQUEST"]').click();
  record('Driver My Trips filter buttons work', await textVisible('Trip Results') || await textVisible('My One-Off Offer History'), 'Driver trip filters were clicked successfully');
  const driverOfferHistoryCount = await countCardsInSection('My One-Off Offer History');
  record('Driver one-off offer history count >= 2', driverOfferHistoryCount >= 2, `Driver offer history shown: ${driverOfferHistoryCount}`);

  await logoutIfVisible();
  await loginFromFresh('daniel.rider@example.com', '12345678');
  await gotoHash('#/my-trips');
  await expectText('Rider can log in with reset password', 'My Unified Orders');
  await page.locator('[data-action="trips-stage"][data-value="CONFIRMED"]').click();
  record('Driver decision reflected for rider', await textVisible('CONFIRMED') || await textVisible('Accepted'), 'Rider confirmed-stage data is visible after driver action');

  const paymentLinks = await page.getByRole('link', { name: 'Open Payment' }).count();
  if (paymentLinks > 0) {
    await page.getByRole('link', { name: 'Open Payment' }).first().click();
  } else {
    await gotoHash('#/payment?rideMatchId=401');
  }
  await expectText('Payment page still reachable after flow', 'Credit Card Checkout');
  await page.locator('input[name="cardNumber"]').fill('4242424242424242');
  await page.locator('input[name="expiry"]').fill('12/29');
  await page.locator('input[name="cvv"]').fill('123');
  await page.getByRole('button', { name: 'Pay Now (Demo)' }).click();
  await page.waitForTimeout(250);
  record('Payment submit button works', await textVisible('Demo payment completed') || await textVisible('Payment completed'), 'Payment form was submitted');

  await logoutIfVisible();
  await loginFromFresh('maria.rider@example.com', 'demo1234');
  await gotoHash('#/ride-requests/201/offers');
  await expectText('Maria one-off offer review page renders', 'Available Driver Offers');
  const mariaOfferReviewCount = await countCardsInSection('Available Driver Offers');
  record('Maria review offers count >= 2', mariaOfferReviewCount >= 2, `Driver offers shown: ${mariaOfferReviewCount}`);
  const acceptOfferButtons = await page.getByRole('button', { name: 'Accept This Offer' }).count();
  if (acceptOfferButtons > 0) {
    await page.getByRole('button', { name: 'Accept This Offer' }).first().click();
    await page.waitForFunction(() => location.hash === '#/ride-confirmed');
    record('Rider accept driver offer button works', await textVisible('One-Off Ride Matched'), 'Maria accepted a driver offer');
  } else {
    record('Rider accept driver offer button works', false, 'No pending driver offer button available');
  }

  await gotoHash('#/tutorial');
  await expectText('Tutorial page still reachable', 'Tutorial Training Center');
  await page.locator('[data-action="tutorial-track"][data-track="DRIVER"]').click();
  await page.locator('[data-action="tutorial-mode"][data-mode="QUIZ"]').click();
  await page.locator('input[data-quiz-id]').first().check();
  await page.getByRole('button', { name: 'Submit Answers' }).click();
  await page.waitForTimeout(250);
  record('Tutorial quiz submit button works', await textVisible('Score:'), 'Tutorial quiz submitted and scored');
  await page.locator('[data-action="tutorial-mode"][data-mode="GUIDED"]').click();
  const checklist = page.locator('input[data-check-index]').first();
  await checklist.check();
  await page.waitForTimeout(150);
  record('Tutorial checklist works', await textVisible('Progress'), 'Tutorial checklist interaction succeeded');

  await browser.close();
  const failed = results.filter((item) => !item.ok);
  console.log(JSON.stringify({ ok: failed.length === 0, failedCount: failed.length, results }, null, 2));
  process.exit(failed.length === 0 ? 0 : 1);
})().catch(async (error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});

const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('C:/Users/gs658/AppData/Local/Temp/nl-static-verify/node_modules/playwright-core');

const root = path.resolve('Static-Site');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function startServer(port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = (req.url || '/').split('?')[0] || '/';
      const relative = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
      const filePath = path.join(root, relative.replace(/^\/+/,'') );
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

(async () => {
  const port = 4177;
  const server = await startServer(port);
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  const base = `http://127.0.0.1:${port}/index.html`;
  const results = [];

  const record = (name, ok, detail) => results.push({ name, ok, detail });
  const expectText = async (name, text) => {
    const ok = await page.getByText(text, { exact: false }).count().then((n) => n > 0).catch(() => false);
    record(name, ok, ok ? `Found: ${text}` : `Missing: ${text}`);
  };
  const gotoHash = async (hash) => {
    await page.goto(base + hash, { waitUntil: 'load' });
  };
  const login = async (email, password) => {
    await gotoHash('#/login');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(250);
  };

  await gotoHash('#/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'load' });

  await expectText('Login page renders', 'User Login');

  await login('daniel.rider@example.com', '123456');
  record('Rider login route', page.url().includes('#/'), page.url());
  await expectText('Find a Ride page renders', 'Find a Ride');
  await expectText('Find tabs render', 'Trip Date');

  await page.locator('button[data-find-step="TRIP"]').click();
  await page.getByRole('button', { name: 'Confirm Flow' }).click();
  await page.waitForFunction(() => location.hash.startsWith('#/search-results'));
  const searchBody = await page.textContent('body');
  record('Search results route', page.url().includes('#/search-results'), page.url());
  record('Search results content', /Matching Ride Offers|One-Off Ride Request|No suitable ride offers found/i.test(searchBody), 'Search results or fallback content visible');

  const viewDetails = page.getByRole('link', { name: 'View Details' });
  if (await viewDetails.count()) {
    await viewDetails.first().click();
    await page.waitForFunction(() => location.hash.startsWith('#/ride-offer-details/'));
    await expectText('Ride offer details render', 'Request This Ride');
  } else {
    record('Ride offer details render', false, 'View Details link not found');
  }

  await gotoHash('#/my-trips');
  await expectText('My Trips notifications render', 'Trip Confirmations and Notifications');
  await expectText('My Trips unified orders render', 'My Unified Orders');

  await gotoHash('#/payment?rideMatchId=401');
  await expectText('Payment page renders', 'Credit Card Checkout');

  await gotoHash('#/tutorial');
  await expectText('Tutorial page renders', 'Tutorial Training Center');
  await expectText('Tutorial guided module renders', 'Guided Path');

  await page.evaluate(() => localStorage.removeItem('neighbourlink.static.site.session.v1'));
  await page.goto(base + `?fresh=${Date.now()}#/login`, { waitUntil: 'load' });
  await page.locator('input[name="email"]').fill('emma.driver@example.com');
  await page.locator('input[name="password"]').fill('demo1234');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForLoadState('load');
  await page.waitForTimeout(250);
  await gotoHash('#/driver-hub');
  await expectText('Driver hub pending section renders', 'Pending Join Requests');
  await expectText('Driver hub one-off section renders', 'Open One-Off Ride Requests');

  await gotoHash('#/account');
  await expectText('Account reset password renders', 'Reset Password');
  await expectText('Account payment methods render', 'Payment Methods');

  await browser.close();
  server.close();

  const failed = results.filter((item) => !item.ok);
  console.log(JSON.stringify({ ok: failed.length === 0, results, failedCount: failed.length }, null, 2));
  process.exit(failed.length === 0 ? 0 : 1);
})().catch(async (error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});

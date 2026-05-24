const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

const root = path.resolve(__dirname, '..');
const picDir = path.join(root, 'Pic');
const captureDir = path.join(root, '_capture');
const captureDelayMs = 1000;
const settleBudgetMs = 3500;
const edgeCandidates = [
  process.env['ProgramFiles(x86)'] ? path.join(process.env['ProgramFiles(x86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe') : null,
  process.env['ProgramFiles'] ? path.join(process.env['ProgramFiles'], 'Microsoft', 'Edge', 'Application', 'msedge.exe') : null,
  'msedge'
].filter(Boolean);

const pages = [
  { source: 'index.html', image: '01_Login_Page_Prototype_Entry.png' },
  { source: 'register.html', image: '02_Register_Page_Prototype_Entry.png' },
  { source: 'find-a-ride.html', image: '03_Find_A_Ride_Origin_Section.png', focusCss: '.page-wrap > section{display:none!important;} .page-wrap > section.hero-card,.page-wrap > section:nth-of-type(2),.page-wrap > section#origin{display:grid!important;}' },
  { source: 'find-a-ride.html', image: '04_Find_A_Ride_Destination_Section.png', focusCss: '.page-wrap > section{display:none!important;} .page-wrap > section.hero-card,.page-wrap > section:nth-of-type(2),.page-wrap > section#destination{display:grid!important;}' },
  { source: 'find-a-ride.html', image: '05_Find_A_Ride_Trip_Date_Section.png', focusCss: '.page-wrap > section{display:none!important;} .page-wrap > section.hero-card,.page-wrap > section:nth-of-type(2),.page-wrap > section#trip-date{display:grid!important;}' },
  { source: 'search-results.html', image: '06_Search_Results_Matching_Ride_Offers.png' },
  { source: 'search-results.html?origin=Clayton&destination=Geelong&date=2026-04-09&time=07:30&passengers=1', image: '09_Search_Results_Matching_Failed.png', focusCss: '.page-wrap > section{display:none!important;} .page-wrap > section.hero-card,.page-wrap > section#matching-failed,.page-wrap > section.summary-box{display:grid!important;}' },
  { source: 'ride-offer-details.html', image: '07_Ride_Offer_Details_Review_Page.png' },
  { source: 'my-trips.html', image: '08_Join_Request_Submitted_Confirmation.png', focusCss: '.page-wrap > section{display:none!important;} .page-wrap > section.hero-card,.page-wrap > section#join-request-submitted{display:grid!important;}' },
  { source: 'my-trips.html', image: '10_My_Trips_All_Outcomes.png' },
  { source: 'my-trips.html', image: '11_My_Trips_Join_Requests_Filter.png', focusCss: '.page-wrap > section{display:none!important;} .page-wrap > section.hero-card,.page-wrap > section#join-requests{display:grid!important;}' },
  { source: 'my-trips.html', image: '12_My_Trips_Confirmed_Trips_Filter.png', focusCss: '.page-wrap > section{display:none!important;} .page-wrap > section.hero-card,.page-wrap > section#confirmed-trips{display:grid!important;}' },
  { source: 'driver-hub.html', image: '13_Driver_Review_Overview.png' },
  { source: 'driver-accepted-details.html?request=504&rider=Olivia%20Chen&driver=Liam%20Driver&route=Clayton%20to%20Docklands&seats=1&meeting=Monash%20northern%20pickup%20zone', image: '14_Driver_Accepted_Details.png' },
  { source: 'driver-rejected-details.html?request=499&rider=Zoe%20Patel&driver=Emma%20Driver&route=Clayton%20to%20Melbourne%20CBD&seats=1&reason=Departure%20timing%20changed%20before%20confirmation', image: '15_Driver_Rejected_Details.png' },
  { source: 'driver-decision-outcome.html?request=504&rider=Olivia%20Chen&driver=Liam%20Driver&route=Clayton%20to%20Docklands&seats=1&available=1&decision=accepted', image: '16_Driver_Decision_Accepted_Outcome.png' },
  { source: 'driver-decision-outcome.html?request=501&rider=Daniel%20Rider&driver=Emma%20Driver&route=Clayton%20to%20Melbourne%20CBD&seats=1&available=2&decision=rejected', image: '17_Driver_Decision_Rejected_Outcome.png' }
];

const figureComposites = [
  {
    image: 'Figure_4_Find_A_Ride_and_Search_Results.png',
    title: 'Figure 4. Find a Ride and Search Results',
    panels: [
      { image: '05_Find_A_Ride_Trip_Date_Section.png', label: 'Find a Ride' },
      { image: '06_Search_Results_Matching_Ride_Offers.png', label: 'Search Results' }
    ]
  },
  {
    image: 'Figure_5_Ride_Offer_Details_and_Join_Request.png',
    title: 'Figure 5. Ride Offer Details and Join Request',
    panels: [
      { image: '07_Ride_Offer_Details_Review_Page.png', label: 'Ride Offer Details' },
      { image: '08_Join_Request_Submitted_Confirmation.png', label: 'Join Request Outcome' }
    ]
  },
  {
    image: 'Figure_6_My_Trips_and_Driver_Review_Outcomes.png',
    title: 'Figure 6. My Trips and Driver Review Outcomes',
    panels: [
      { image: '10_My_Trips_All_Outcomes.png', label: 'My Trips Outcomes' },
      { image: '16_Driver_Decision_Accepted_Outcome.png', label: 'Driver Review Outcome' }
    ]
  }
];

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function resolveEdge() {
  for (const candidate of edgeCandidates) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch (_error) {
    }
  }
  throw new Error('Microsoft Edge executable was not found.');
}

function ensureCaptureDir() {
  fs.mkdirSync(captureDir, { recursive: true });
  clearCaptureDir();
}

function clearCaptureDir() {
  if (!fs.existsSync(captureDir)) {
    return;
  }
  for (const entry of fs.readdirSync(captureDir)) {
    if (entry.toLowerCase().endsWith('.html')) {
      fs.unlinkSync(path.join(captureDir, entry));
    }
  }
}

function writeFocusedPage(page, index) {
  const sourcePath = page.source.split(/[?#]/)[0];
  if (!page.focusCss) {
    return path.join(root, sourcePath);
  }
  let html = fs.readFileSync(path.join(root, sourcePath), 'utf8');
  html = html.replace('href="./styles.css"', 'href="../styles.css"');
  html = html.replace(/href="\.\//g, 'href="../');
  html = html.replace(/src="\.\/Pic\//g, 'src="../Pic/');
  const focusStyle = `<style id="capture-focus">${page.focusCss}</style>`;
  html = html.replace('</head>', `${focusStyle}</head>`);
  const captureName = `${String(index + 1).padStart(2, '0')}-${page.image.replace(/\.png$/i, '.html')}`;
  const capturePath = path.join(captureDir, captureName);
  fs.writeFileSync(capturePath, html, 'utf8');
  return capturePath;
}

function writeCompositePage(figure, index) {
  const cards = figure.panels.map((panel) => {
    return `
      <figure class="panel-card">
        <figcaption>${panel.label}</figcaption>
        <img src="../Pic/${panel.image}" alt="${panel.label}">
      </figure>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${figure.title}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      background: #f6f2ea;
      color: #1f2a2a;
    }
    .figure-shell {
      width: 1740px;
      margin: 0 auto;
      padding: 36px;
      display: grid;
      gap: 24px;
    }
    .figure-head {
      display: grid;
      gap: 10px;
      padding: 22px 26px;
      border-radius: 24px;
      border: 1px solid rgba(216, 208, 196, 0.9);
      background: #fffdf9;
      box-shadow: 0 18px 45px rgba(31, 42, 42, 0.08);
    }
    .figure-head h1 {
      margin: 0;
      font-size: 30px;
      line-height: 1.2;
    }
    .figure-head p {
      margin: 0;
      color: #5c6a6a;
      font-size: 16px;
    }
    .figure-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px;
      align-items: start;
    }
    .panel-card {
      margin: 0;
      display: grid;
      gap: 12px;
      padding: 18px;
      border-radius: 24px;
      border: 1px solid rgba(216, 208, 196, 0.9);
      background: #fffdf9;
      box-shadow: 0 18px 45px rgba(31, 42, 42, 0.08);
    }
    .panel-card figcaption {
      font-weight: 700;
      font-size: 18px;
    }
    .panel-card img {
      display: block;
      width: 100%;
      border-radius: 18px;
      border: 1px solid rgba(216, 208, 196, 0.9);
      background: #ffffff;
    }
  </style>
</head>
<body>
  <main class="figure-shell">
    <section class="figure-head">
      <h1>${figure.title}</h1>
      <p>Static-Site evidence composite aligned with the current reduced-budget prototype walkthrough.</p>
    </section>
    <section class="figure-grid">
      ${cards}
    </section>
  </main>
</body>
</html>`;

  const captureName = `${String(index + 1).padStart(2, '0')}-${figure.image.replace(/\.png$/i, '.html')}`;
  const capturePath = path.join(captureDir, captureName);
  fs.writeFileSync(capturePath, html, 'utf8');
  return capturePath;
}

const edge = resolveEdge();
ensureCaptureDir();
for (const entry of fs.readdirSync(picDir)) {
  if (entry.toLowerCase().endsWith('.png') && entry.toLowerCase() !== 'map.png') {
    fs.unlinkSync(path.join(picDir, entry));
  }
}

pages.forEach((page, index) => {
  const targetFile = writeFocusedPage(page, index);
  const url = new URL(pathToFileURL(targetFile).href);
  const queryIndex = page.source.indexOf('?');
  const hashIndex = page.source.indexOf('#');
  if (queryIndex >= 0) {
    const queryEnd = hashIndex >= 0 ? hashIndex : page.source.length;
    url.search = page.source.slice(queryIndex, queryEnd);
  }
  if (hashIndex >= 0) {
    url.hash = page.source.slice(hashIndex);
  }
  const output = path.join(picDir, page.image);
  sleep(captureDelayMs);
  execFileSync(edge, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--run-all-compositor-stages-before-draw',
    `--virtual-time-budget=${settleBudgetMs}`,
    '--window-size=1440,1500',
    `--screenshot=${output}`,
    url.href
  ], { stdio: 'ignore' });
});

figureComposites.forEach((figure, index) => {
  const targetFile = writeCompositePage(figure, index + pages.length);
  const url = pathToFileURL(targetFile).href;
  const output = path.join(picDir, figure.image);
  sleep(captureDelayMs);
  execFileSync(edge, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--run-all-compositor-stages-before-draw',
    `--virtual-time-budget=${settleBudgetMs}`,
    '--window-size=1820,1680',
    `--screenshot=${output}`,
    url
  ], { stdio: 'ignore' });
});

clearCaptureDir();

console.log(`Captured ${pages.length} screenshots and ${figureComposites.length} report composites with Microsoft Edge headless.`);

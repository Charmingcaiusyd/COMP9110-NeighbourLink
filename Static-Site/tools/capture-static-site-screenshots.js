const fs = require("fs");
const path = require("path");
const http = require("http");
const { chromium } = require("C:/Users/gs658/AppData/Local/Temp/nl-static-verify/node_modules/playwright-core");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "Pic");

fs.mkdirSync(outDir, { recursive: true });

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = (req.url || "/").split("?")[0] || "/";
      const relative = decodeURIComponent(urlPath === "/" ? "/index.html" : urlPath);
      const filePath = path.join(root, relative.replace(/^\/+/, ""));
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Not Found");
          return;
        }
        res.writeHead(200, {
          "Content-Type": mime[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        });
        res.end(data);
      });
    });
    server.listen(4173, "127.0.0.1", () => resolve(server));
  });
}

async function captureScreenshots() {
  const server = await startServer();
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  const base = "http://127.0.0.1:4173/index.html";
  const manifest = [];

  async function goto(hash) {
    await page.goto(base + hash, { waitUntil: "load" });
  }

  async function shotPage(fileName, title, note) {
    await page.screenshot({
      path: path.join(outDir, fileName + ".png"),
      fullPage: true,
    });
    manifest.push({ file: fileName + ".png", title, note });
  }

  async function shotLocator(locator, fileName, title, note) {
    await locator.screenshot({
      path: path.join(outDir, fileName + ".png"),
    });
    manifest.push({ file: fileName + ".png", title, note });
  }

  async function login(email, password) {
    await goto("#/login");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole("button", { name: "Log In" }).click();
    await page.waitForLoadState("load");
    await page.waitForTimeout(150);
  }

  await goto("#/login");
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "load" });

  await shotPage(
    "01_Login_Page_Static_SignIn",
    "Login Page - Static Sign In",
    "Public login page with fixed demo accounts."
  );

  await page.getByRole("link", { name: "Register" }).click();
  await page.waitForFunction(() => location.hash === "#/register");
  await shotPage(
    "02_Register_Page_Rider_Onboarding",
    "Register Page - Rider Onboarding",
    "Default rider registration form."
  );

  await page.locator('select[name="role"]').selectOption("DRIVER");
  await page.waitForTimeout(100);
  await shotPage(
    "03_Register_Page_Driver_Document_Upload",
    "Register Page - Driver Document Upload",
    "Driver onboarding with licence, seat proof, and rego file fields."
  );

  await goto("#/tutorial");
  await shotPage(
    "04_Tutorial_Page_Rider_Guided_Mode",
    "Tutorial Page - Rider Guided Mode",
    "Hidden direct-access tutorial route for rider walkthroughs."
  );

  await page.getByRole("button", { name: "Driver Operations" }).click();
  await page.locator('[data-action="tutorial-mode"][data-mode="QUIZ"]').click();
  await page.waitForTimeout(100);
  await shotPage(
    "05_Tutorial_Page_Driver_Quiz_Mode",
    "Tutorial Page - Driver Quiz Mode",
    "Driver tutorial track in quiz mode."
  );

  await login("maria.rider@example.com", "demo1234");
  await page.waitForFunction(() => location.hash === "#/");
  await shotPage(
    "06_Find_A_Ride_Origin_Step",
    "Find a Ride - Origin Step",
    "Unified rider flow starting on the Origin step."
  );

  await page.locator('[data-find-step="DESTINATION"]').click();
  await page.waitForTimeout(100);
  await shotPage(
    "07_Find_A_Ride_Destination_Step",
    "Find a Ride - Destination Step",
    "Destination step with live OpenStreetMap search, map selection, and route preview."
  );

  await page.locator('[data-loc-query="destination"]').fill("Melbourne");
  await page.locator('[data-action="loc-search"][data-scope="destination"]').click();
  try {
    await page.locator(".location-results").waitFor({ state: "visible", timeout: 12000 });
  } catch (_error) {
    // Public map search may vary by network condition; keep the flow moving even if suggestions are delayed.
  }
  await page.waitForTimeout(250);
  await shotPage(
    "28_Find_A_Ride_Destination_Live_Search_State",
    "Find a Ride - Destination Live Search State",
    "Destination step after triggering a live OpenStreetMap search from the browser-only static demo."
  );
  if (await page.locator(".location-result-item").count()) {
    await page.locator(".location-result-item").first().click();
    await page.waitForTimeout(150);
  }

  await page.locator('[data-find-step="TRIP"]').click();
  await page.waitForTimeout(100);
  await shotPage(
    "08_Find_A_Ride_Trip_Date_Step",
    "Find a Ride - Trip Date Step",
    "Trip date, departure time, flexibility, and passenger controls."
  );

  await page.getByRole("button", { name: "Confirm Flow" }).click();
  await page.waitForFunction(() => location.hash.startsWith("#/search-results"));
  await shotPage(
    "09_Search_Results_Matching_Ride_Offers",
    "Search Results - Matching Ride Offers",
    "Offer search results for a same-day within-three-hours ride search."
  );

  await page.getByRole("link", { name: "View Details" }).first().click();
  await page.waitForFunction(() => location.hash.startsWith("#/ride-offer-details/"));
  await shotPage(
    "10_Ride_Offer_Details_Trust_And_Seats",
    "Ride Offer Details - Trust and Seats",
    "Driver trust summary, verification cues, and seat request form."
  );

  await page.getByRole("button", { name: "Request This Ride" }).click();
  await page.waitForFunction(() => location.hash === "#/ride-confirmed");
  await shotPage(
    "11_Join_Request_Submitted_Confirmation",
    "Ride Confirmed - Join Request Submitted",
    "Confirmation page after rider submits a join request."
  );

  await page.getByRole("link", { name: "Open My Trips" }).click();
  await page.waitForFunction(() => location.hash === "#/my-trips");
  await shotPage(
    "12_My_Trips_Unified_Orders_Overview",
    "My Trips - Unified Orders Overview",
    "Rider view with notifications and unified order cards."
  );
  await shotLocator(
    page.locator("section.section-card").nth(0),
    "13_My_Trips_Notifications_Section",
    "My Trips - Notifications Section",
    "Dedicated notifications section inside My Trips."
  );

  await page.locator('[data-action="trips-path"][data-value="JOIN_REQUEST"]').click();
  await page.waitForTimeout(100);
  await shotPage(
    "14_My_Trips_Filtered_Join_Request_View",
    "My Trips - Join Request Filter View",
    "My Trips filtered to join-request records only."
  );

  await page.locator('[data-action="trips-stage"][data-value="CONFIRMED"]').click();
  await page.waitForTimeout(120);
  await shotPage(
    "29_My_Trips_Confirmed_Filter_With_Payment_CTA",
    "My Trips - Confirmed Filter With Payment CTA",
    "Rider My Trips narrowed to confirmed join-path items, including payment-entry actions for matched trips."
  );
  await page.locator('[data-action="trips-stage"][data-value="ALL"]').click();
  await page.locator('[data-action="trips-path"][data-value="ALL"]').click();
  await page.waitForTimeout(120);

  await page.getByRole("link", { name: "Find a Ride" }).click();
  await page.waitForFunction(() => location.hash === "#/");
  await page.locator('[data-find-step="TRIP"]').click();
  await page.locator('input[type="date"]').fill("2026-04-10");
  await page.locator('input[type="time"]').fill("10:00");
  await page.getByRole("button", { name: "Confirm Flow" }).click();
  await page.waitForFunction(() => location.hash.startsWith("#/search-results"));
  await shotPage(
    "15_Search_Results_Auto_Request_Fallback_Message",
    "Search Results - Auto Request Fallback",
    "Automatic conversion to a one-off request when the trip falls outside the immediate search window."
  );

  await page.waitForFunction(() => location.hash === "#/my-trips", { timeout: 5000 });
  await shotPage(
    "16_My_Trips_Auto_Created_One_Off_Request",
    "My Trips - Auto-Created One-Off Request",
    "My Trips after the fallback flow creates a one-off ride request."
  );

  await goto("#/ride-requests/201/offers");
  await page.waitForFunction(() => location.hash.includes("/ride-requests/201/offers"));
  await shotPage(
    "17_Review_Driver_Offers_For_One_Off_Request",
    "Review Driver Offers - One-Off Request",
    "Rider review page for driver responses to a one-off request."
  );

  await page.getByRole("button", { name: "Accept This Offer" }).first().click();
  await page.waitForFunction(() => location.hash === "#/ride-confirmed");
  await shotPage(
    "18_One_Off_Ride_Matched_Confirmation",
    "Ride Confirmed - One-Off Ride Matched",
    "Confirmation after the rider accepts a driver offer for a one-off request."
  );

  await page.getByRole("link", { name: "Go to Payment" }).click();
  await page.waitForFunction(() => location.hash.startsWith("#/payment?rideMatchId="));
  await shotPage(
    "19_Payment_Demo_Checkout_Page",
    "Payment Demo - Checkout Page",
    "Credit-card payment template before submission."
  );

  await page.locator('input[name="cardNumber"]').fill("4242424242424242");
  await page.locator('input[name="expiry"]').fill("12/29");
  await page.locator('input[name="cvv"]').fill("123");
  await page.getByRole("button", { name: "Pay Now (Demo)" }).click();
  await page.waitForTimeout(120);
  await shotPage(
    "20_Payment_Demo_Success_Message",
    "Payment Demo - Success Message",
    "Payment page after the demo payment has been submitted successfully."
  );

  await page.getByRole("link", { name: "Account" }).click();
  await page.waitForFunction(() => location.hash === "#/account");
  await shotPage(
    "21_Account_Settings_Reset_Password_And_Payments",
    "Account Settings - Reset Password and Payments",
    "Account page with reset-password form and saved payment methods."
  );

  await page.locator('input[name="currentPassword"]').fill("demo1234");
  await page.locator('input[name="newPassword"]').fill("demo5678");
  await page.locator('input[name="confirmPassword"]').fill("demo5678");
  await page.getByRole("button", { name: "Reset Password" }).click();
  await page.waitForTimeout(120);
  await shotPage(
    "30_Account_Settings_Password_Reset_Success",
    "Account Settings - Password Reset Success",
    "Account page after a successful password reset in the browser-only demo."
  );

  await page.locator('input[name="last4"]').fill("1111");
  await page.locator('input[name="expiry"]').fill("01/30");
  await page.locator('select[name="primary"]').selectOption("YES");
  await page.getByRole("button", { name: "Save Payment Method" }).click();
  await page.waitForTimeout(120);
  await shotPage(
    "22_Account_Settings_New_Default_Payment_Method",
    "Account Settings - New Default Payment Method",
    "Account page after saving a new default payment method."
  );

  await page.getByRole("button", { name: "Log Out" }).click();
  await page.waitForFunction(() => location.hash === "#/login");
  await page.evaluate(() => localStorage.removeItem("neighbourlink.static.site.session.v1"));
  await page.goto(base + `?fresh=${Date.now()}#/login`, { waitUntil: "load" });
  await page.locator('input[name="email"]').fill("emma.driver@example.com");
  await page.locator('input[name="password"]').fill("demo1234");
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForFunction(() => location.hash === "#/driver-hub");
  await shotPage(
    "23_Driver_Hub_Pending_Join_Requests",
    "Driver Hub - Pending Join Requests",
    "Driver dashboard landing view for join-request decisions."
  );

  await shotLocator(
    page.locator("section.section-card").nth(1),
    "24_Driver_Hub_Open_One_Off_Request_Response_Form",
    "Driver Hub - Open One-Off Request Response Form",
    "Driver response form for open rider one-off requests."
  );

  const joinForm = page.locator('[data-form="driver-join"]').first();
  await joinForm.locator('input[name="meetingPoint"]').fill("Clayton Station Gate 1");
  await joinForm.getByRole("button", { name: "Submit Decision" }).click();
  await page.waitForTimeout(150);
  await shotPage(
    "25_Driver_Hub_Join_Request_Accepted_State",
    "Driver Hub - Join Request Accepted State",
    "Driver Hub after a pending join request has been accepted."
  );

  const rejectedJoinForm = page.locator('[data-form="driver-join"]').first();
  await rejectedJoinForm.locator('select[name="decision"]').selectOption("REJECTED");
  await rejectedJoinForm.getByRole("button", { name: "Submit Decision" }).click();
  await page.waitForTimeout(150);
  await shotPage(
    "31_Driver_Hub_Join_Request_Rejected_State",
    "Driver Hub - Join Request Rejected State",
    "Driver Hub after the driver records a rejection on a pending join request."
  );

  const responseForm = page.locator('[data-form="driver-request-offer"]').first();
  await responseForm.locator('input[name="meetingPoint"]').fill("Monash North Loop");
  await responseForm.getByRole("button", { name: "Respond to Request" }).click();
  await page.waitForTimeout(150);
  await shotLocator(
    page.locator("section.section-card").nth(2),
    "26_Driver_Hub_One_Off_Offer_History",
    "Driver Hub - One-Off Offer History",
    "Driver history after submitting a one-off response."
  );

  await page.getByRole("link", { name: "My Trips" }).click();
  await page.waitForFunction(() => location.hash === "#/my-trips");
  await shotPage(
    "27_Driver_My_Trips_Activity_Stream",
    "My Trips - Driver Activity Stream",
    "Driver-side My Trips activity stream after decisions and responses."
  );

  await page.locator('[data-action="trips-trip-type"][data-value="ONE_OFF_REQUEST"]').click();
  await page.waitForTimeout(120);
  await shotPage(
    "32_Driver_My_Trips_Filtered_One_Off_Request_View",
    "My Trips - Driver One-Off Request Filter View",
    "Driver My Trips narrowed to confirmed one-off request matches and related activity."
  );

  const readmeLines = [
    "# Screenshot Index",
    "",
    `Total screenshots: ${manifest.length}`,
    "",
    "Detailed guide: [../docs/FEATURE_SCREENSHOT_WALKTHROUGH.md](../docs/FEATURE_SCREENSHOT_WALKTHROUGH.md)",
    "",
    "| File | Functional Display Name | Description |",
    "| --- | --- | --- |",
    ...manifest.map((item) => `| ${item.file} | ${item.title} | ${item.note} |`),
    "",
  ];
  fs.writeFileSync(path.join(outDir, "README.md"), readmeLines.join("\n"), "utf8");

  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  console.log(`Saved ${manifest.length} screenshots to ${outDir}`);
}

module.exports = captureScreenshots;

if (require.main === module) {
  captureScreenshots().catch((error) => {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  });
}

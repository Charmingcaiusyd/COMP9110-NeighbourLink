import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const modeTabs = [
  {
    id: 'GUIDED',
    title: 'Guided Path',
    description: 'Scenario-based steps with system checkpoints.',
  },
  {
    id: 'TASKS',
    title: 'Task Playbooks',
    description: 'Goal-driven cards for common real usage tasks.',
  },
  {
    id: 'DEMO',
    title: 'Demo Script',
    description: 'Minute-by-minute showcase script for presentations.',
  },
  {
    id: 'TROUBLESHOOT',
    title: 'Troubleshooting',
    description: 'Issue diagnosis with likely causes and fixes.',
  },
  {
    id: 'QUIZ',
    title: 'Knowledge Check',
    description: 'Quick self-check to validate understanding.',
  },
];

const tutorialGuides = [
  {
    id: 'RIDER',
    label: 'Rider Tutorial',
    duration: '10-15 min practical training',
    objective: 'Find the right offer, evaluate trust, submit correctly, and track every status in My Trips.',
    formats: ['Step timeline', 'Decision cards', 'Task cards', 'Troubleshooting', 'Knowledge quiz'],
    checklist: [
      'I can complete Find a Ride in the 3-step flow: Origin -> Destination -> Trip Date.',
      'I know that Confirm is required on Trip Date before search/request is sent.',
      'I can inspect trust info (profile + ratings) before submitting Join Request.',
      'I can explain the difference between Join Request History and One-Off Request History.',
      'I can switch to one-off request flow when no suitable offers are returned.',
      'I can review post-trip and submit rating from My Trips history.',
    ],
    decisions: [
      {
        title: 'No suitable ride offers found',
        recommendation: 'Switch to Post a Ride Request and let drivers respond.',
        action: '/post-ride-request',
      },
      {
        title: 'Offer exists but trust is unclear',
        recommendation: 'Open offer details first, review profile/rating, then decide.',
        action: '/search-results',
      },
      {
        title: 'Join request is rejected',
        recommendation: 'Adjust suburb/date/time assumptions and submit a new request.',
        action: '/my-trips',
      },
    ],
    steps: [
      {
        title: 'Plan the trip search correctly',
        goal: 'Avoid false negatives and make matching logic work for your query.',
        actions: [
          'Enter Origin first, then Destination, then Trip Date.',
          'Set passenger count and optional time flex only after date is correct.',
          'Use Confirm on the final step to submit.',
        ],
        systemSignals: [
          'Search Summary should reflect your final fields.',
          'Results page should show matching offers or a clear no-result state.',
        ],
        ifBlocked: 'If no results: verify suburb spelling, same-day date, and time tolerance settings.',
      },
      {
        title: 'Evaluate trust before request',
        goal: 'Make acceptance decisions with transparent profile quality.',
        actions: [
          'Open Ride Offer Details from the result card.',
          'Check average rating, rating count, trust notes, and profile bio.',
          'Submit only if meeting point and route expectations are acceptable.',
        ],
        systemSignals: [
          'Join Request action should be available only for valid rider session.',
          'Submitted request should appear in My Join Request History.',
        ],
        ifBlocked: 'If action fails with session errors, sign out/in and retry from details page.',
      },
      {
        title: 'Track lifecycle after submission',
        goal: 'Use the correct history section to avoid confusion.',
        actions: [
          'Open My Trips -> My Join Request History.',
          'Switch among Pending, Accepted, Rejected, All.',
          'Use My One-Off Request History separately for posted requests and offers.',
        ],
        systemSignals: [
          'Accepted join requests can include RideMatch id and meeting point.',
          'Rejected items should remain visible for audit and re-attempt planning.',
        ],
        ifBlocked: 'If list looks empty, check current filter tab and pagination page first.',
      },
      {
        title: 'Complete trust loop with rating',
        goal: 'Feed trust data back into the ecosystem after trip completion.',
        actions: [
          'Open My Trips history section.',
          'Locate completed/eligible trip item.',
          'Submit score + optional comment for counterpart.',
        ],
        systemSignals: [
          'Rating confirmation should show target user and score.',
          'Profile averages update after new ratings are stored.',
        ],
        ifBlocked: 'If target cannot be resolved, refresh My Trips and retry on matched trip item.',
      },
    ],
    tasks: [
      {
        title: 'Task A: Find and join an existing offer',
        whenToUse: 'You want an immediate match with an existing driver route.',
        inputs: 'Origin suburb, destination suburb, trip date, passenger count',
        actions: [
          'Run Find a Ride flow and review search results.',
          'Open details for trust and meeting expectations.',
          'Submit Join Request and track status in My Trips.',
        ],
        doneWhen: 'Join Request is visible and status is Pending or Accepted.',
      },
      {
        title: 'Task B: Fallback when no offers match',
        whenToUse: 'Search results return no suitable offers.',
        inputs: 'Same route details, preferred time, passenger count, rider notes',
        actions: [
          'Open Post a Ride Request.',
          'Finish 3-step flow and press Confirm and Submit.',
          'Monitor incoming driver offers in My One-Off Request History.',
        ],
        doneWhen: 'Request appears in one-off history with status OPEN.',
      },
      {
        title: 'Task C: Accept one driver offer safely',
        whenToUse: 'Multiple drivers responded to your one-off request.',
        inputs: 'Offer details + trust summary + meeting point clarity',
        actions: [
          'Compare driver offers for seats, meeting point, and trust.',
          'Accept one offer only.',
          'Verify request moves to MATCHED and others are rejected.',
        ],
        doneWhen: 'RideMatch id exists and ride request status becomes MATCHED.',
      },
      {
        title: 'Task D: Review and rate after trip',
        whenToUse: 'Trip has completed and you want to contribute trust signals.',
        inputs: 'Trip record in My Trips history',
        actions: [
          'Open history item.',
          'Submit 1-5 score and concise comment.',
          'Confirm response message appears.',
        ],
        doneWhen: 'Rating is saved and acknowledged in UI.',
      },
    ],
    demo: [
      {
        minute: '00:00',
        presenterLine: 'Start on Find a Ride and explain the 3-step flow.',
        operatorAction: 'Set Origin and Destination, then Trip Date.',
        expectedResult: 'Search Summary reflects entered route/date.',
      },
      {
        minute: '01:30',
        presenterLine: 'Open one result and highlight trust-before-action.',
        operatorAction: 'Show profile, rating count, trust notes, then Join Request.',
        expectedResult: 'Join request submission succeeds.',
      },
      {
        minute: '03:00',
        presenterLine: 'Switch to My Trips to show request tracking.',
        operatorAction: 'Open My Join Request History tabs.',
        expectedResult: 'Pending/Accepted/Rejected/All views are clear.',
      },
      {
        minute: '04:30',
        presenterLine: 'Show no-result fallback strategy.',
        operatorAction: 'Navigate to Post a Ride Request and submit one-off request.',
        expectedResult: 'Success message then redirect to My Trips.',
      },
      {
        minute: '06:00',
        presenterLine: 'Demonstrate one-off offer review and acceptance path.',
        operatorAction: 'Open request offers and accept one valid offer.',
        expectedResult: 'Match created and request becomes MATCHED.',
      },
      {
        minute: '08:00',
        presenterLine: 'Close with trust feedback loop.',
        operatorAction: 'Submit rating on history trip item.',
        expectedResult: 'Rating confirmation displayed.',
      },
    ],
    troubleshooting: [
      {
        issue: 'I get no search results even with common routes.',
        likelyCause: 'Suburb mismatch, date mismatch, or time window too strict.',
        fix: 'Re-check suburb spelling, keep same-day date, increase time tolerance if needed.',
      },
      {
        issue: 'Join request does not show in My Trips.',
        likelyCause: 'Wrong tab/filter or pagination page.',
        fix: 'Open My Join Request History, switch to All, then check page controls.',
      },
      {
        issue: 'Rider not found appears during one-off submit.',
        likelyCause: 'Local session user no longer exists in database.',
        fix: 'Re-login and resubmit. The app now redirects to login for expired rider sessions.',
      },
      {
        issue: 'Cannot submit from Trip Date step.',
        likelyCause: 'Final Confirm button not clicked or invalid form field.',
        fix: 'Click Confirm and Submit explicitly and verify date/time/passenger count are valid.',
      },
      {
        issue: 'Accepted request still not visible as confirmed trip.',
        likelyCause: 'Wrong section checked or data not refreshed yet.',
        fix: 'Refresh My Trips and check Trip Filter + My Join Request History together.',
      },
    ],
    statusGuide: [
      { status: 'PENDING', meaning: 'Awaiting decision by the other party.', nextAction: 'Monitor history and avoid duplicate submissions.' },
      { status: 'ACCEPTED', meaning: 'Decision approved and match can be created/linked.', nextAction: 'Check meeting point and trip details.' },
      { status: 'REJECTED', meaning: 'Decision declined.', nextAction: 'Adjust criteria and retry or switch to one-off flow.' },
      { status: 'OPEN', meaning: 'Request/offer is active for responses.', nextAction: 'Track inbound offers and respond in time.' },
      { status: 'MATCHED', meaning: 'Final one-off offer has been accepted.', nextAction: 'Review confirmed trip record and prepare meeting.' },
      { status: 'CLOSED', meaning: 'Request lifecycle ended.', nextAction: 'Create a new request if still needed.' },
    ],
    quiz: [
      {
        id: 'r1',
        question: 'When is the search/request flow actually submitted?',
        options: ['Immediately after Destination step', 'When Trip Date step is selected', 'Only after final Confirm action', 'After opening My Trips'],
        answer: 2,
        explain: 'Submission is intentionally gated by explicit Confirm at final step.',
      },
      {
        id: 'r2',
        question: 'Where do you track join request outcomes?',
        options: ['Profile page', 'My Join Request History', 'Driver Hub only', 'Admin dashboard only'],
        answer: 1,
        explain: 'Join request lifecycle is tracked in My Join Request History tabs.',
      },
      {
        id: 'r3',
        question: 'What should you do when no offers match your search?',
        options: ['Wait only', 'Switch to Post a Ride Request', 'Delete profile', 'Open admin login'],
        answer: 1,
        explain: 'One-off request is the designed fallback path for no-result cases.',
      },
      {
        id: 'r4',
        question: 'What trust data should you review before requesting?',
        options: ['Only vehicle color', 'Only date/time', 'Profile + ratings summary', 'Only meeting point'],
        answer: 2,
        explain: 'Trust-before-acceptance is a core business rule.',
      },
      {
        id: 'r5',
        question: 'What does MATCHED indicate for one-off request?',
        options: ['No offers received', 'Offer pending', 'Final offer accepted', 'Account inactive'],
        answer: 2,
        explain: 'MATCHED means one selected offer created the confirmed match path.',
      },
    ],
    actions: [
      { label: 'Start Find a Ride', to: '/' },
      { label: 'Post One-Off Request', to: '/post-ride-request', secondary: true },
      { label: 'Open My Trips', to: '/my-trips', secondary: true },
    ],
  },
  {
    id: 'DRIVER',
    label: 'Driver Tutorial',
    duration: '10-16 min practical training',
    objective: 'Handle requests decisively, keep seat logic safe, and manage one-off offers without duplication.',
    formats: ['Operational checklist', 'Decision matrix', 'Task cards', 'Troubleshooting', 'Knowledge quiz'],
    checklist: [
      'I can process pending join requests from Driver Hub.',
      'I understand ACCEPT requires a valid meeting point.',
      'I can avoid duplicate pending offers for the same one-off request.',
      'I can use map context before replying to one-off requests.',
      'I can monitor confirmed trips in My Trips.',
      'I can explain why seat and status updates must happen immediately.',
    ],
    decisions: [
      {
        title: 'Seat capacity is insufficient',
        recommendation: 'Reject request or adjust offered seats to valid capacity.',
        action: '/driver-hub',
      },
      {
        title: 'Route is acceptable but trust concerns exist',
        recommendation: 'Review rider context and decide conservatively.',
        action: '/driver-hub',
      },
      {
        title: 'Already submitted pending offer for same one-off request',
        recommendation: 'Do not re-submit. Wait for rider decision.',
        action: '/my-trips',
      },
    ],
    steps: [
      {
        title: 'Start with pending join queue',
        goal: 'Process rider intents quickly and keep queue healthy.',
        actions: [
          'Open Driver Hub pending requests list.',
          'Review requested seats, time, and route.',
          'Decide ACCEPT or REJECT promptly.',
        ],
        systemSignals: [
          'Decision updates join request status immediately.',
          'Accepted decision updates seat count and may close offer when full.',
        ],
        ifBlocked: 'If decision fails, verify you are the owner driver for that offer.',
      },
      {
        title: 'Respond to one-off requests with map support',
        goal: 'Send high-quality responses that rider can accept confidently.',
        actions: [
          'Inspect pickup/destination markers in Driver Hub.',
          'Confirm proposedSeats satisfies rider passengerCount.',
          'Submit one pending offer with clear meeting point.',
        ],
        systemSignals: [
          'Duplicate pending offer for same driver/request is blocked.',
          'Offer appears in driver one-off offer history.',
        ],
        ifBlocked: 'If blocked, check whether your pending offer already exists for that request.',
      },
      {
        title: 'Track accepted outcomes',
        goal: 'Separate confirmed trips from still-open negotiations.',
        actions: [
          'Open My Trips for confirmed ride matches.',
          'Use one-off offer history for pending/rejected/accepted offers.',
          'Keep meeting point and status consistent across views.',
        ],
        systemSignals: [
          'Accepted one-off offer should map to RideMatch with status CONFIRMED.',
          'Other pending offers should transition to rejected when final match exists.',
        ],
        ifBlocked: 'If history seems inconsistent, refresh and verify filter tabs + page index.',
      },
      {
        title: 'Maintain verification readiness',
        goal: 'Ensure account remains eligible for sending offers.',
        actions: [
          'Keep licence/spare-seat/rego documents up to date.',
          'Ensure account status remains ACTIVE.',
          'Monitor admin verification notes if action is restricted.',
        ],
        systemSignals: [
          'Unverified or inactive drivers cannot complete key offer actions.',
          'Verification status is visible in admin governance panel.',
        ],
        ifBlocked: 'Contact admin workflow and update required documents before retry.',
      },
    ],
    tasks: [
      {
        title: 'Task A: Accept a join request safely',
        whenToUse: 'Rider request matches your route and capacity.',
        inputs: 'requestedSeats, availableSeats, rider context',
        actions: [
          'Open pending queue in Driver Hub.',
          'Enter meeting point and accept.',
          'Confirm seat decrement and request status update.',
        ],
        doneWhen: 'Join request marked ACCEPTED and RideMatch is created.',
      },
      {
        title: 'Task B: Reject stale or invalid requests',
        whenToUse: 'Capacity/time mismatch or unclear rider expectations.',
        inputs: 'Route mismatch or invalid seat demand',
        actions: [
          'Reject directly from pending request card.',
          'Ensure status becomes REJECTED.',
          'Continue processing remaining queue.',
        ],
        doneWhen: 'Rejected item removed from active pending workload.',
      },
      {
        title: 'Task C: Send one-off response',
        whenToUse: 'Open rider request is suitable for your trip.',
        inputs: 'proposedSeats, meetingPoint, request map context',
        actions: [
          'Open one-off request card.',
          'Submit response with valid proposed seats and meeting point.',
          'Verify one pending response exists in history.',
        ],
        doneWhen: 'Offer appears as PENDING in one-off offer history.',
      },
      {
        title: 'Task D: Handle acceptance outcome',
        whenToUse: 'Rider accepted one of the offers.',
        inputs: 'Offer status update + matched request details',
        actions: [
          'Open My Trips to verify confirmed match.',
          'Check meeting point and route details.',
          'Archive mental workload for closed negotiations.',
        ],
        doneWhen: 'Confirmed trip is visible and lifecycle is complete.',
      },
    ],
    demo: [
      {
        minute: '00:00',
        presenterLine: 'Open Driver Hub and explain queue-first workflow.',
        operatorAction: 'Show pending join requests list.',
        expectedResult: 'Pending queue and rider request context are visible.',
      },
      {
        minute: '01:30',
        presenterLine: 'Accept one request with meeting point.',
        operatorAction: 'Enter meeting point and confirm accept.',
        expectedResult: 'Status becomes ACCEPTED and seats update.',
      },
      {
        minute: '03:00',
        presenterLine: 'Reject one unsuitable request.',
        operatorAction: 'Reject action on another request.',
        expectedResult: 'Rejected status appears; queue shrinks.',
      },
      {
        minute: '04:30',
        presenterLine: 'Respond to one-off open requests.',
        operatorAction: 'Submit response with proposed seats + meeting point.',
        expectedResult: 'Offer created with PENDING status.',
      },
      {
        minute: '06:30',
        presenterLine: 'Show duplicate-protection behavior.',
        operatorAction: 'Attempt second pending offer on same request.',
        expectedResult: 'System blocks duplicate pending submission.',
      },
      {
        minute: '08:00',
        presenterLine: 'Close with confirmed trip tracking.',
        operatorAction: 'Open My Trips and inspect confirmed records.',
        expectedResult: 'Driver can see final matched trips cleanly.',
      },
    ],
    troubleshooting: [
      {
        issue: 'Accept action fails even though request is pending.',
        likelyCause: 'Missing meeting point or ownership mismatch.',
        fix: 'Provide meeting point and verify you own the underlying ride offer.',
      },
      {
        issue: 'Cannot send one-off offer response.',
        likelyCause: 'Account inactive, unverified licence, or insufficient capacity.',
        fix: 'Check verification/account state and confirm proposedSeats <= spareSeatCapacity.',
      },
      {
        issue: 'System says duplicate pending offer.',
        likelyCause: 'You already have a pending offer for this ride request.',
        fix: 'Wait for rider decision or use a different request.',
      },
      {
        issue: 'Pending requests remain after seat is full.',
        likelyCause: 'State not refreshed in current view.',
        fix: 'Refresh Driver Hub; remaining stale pending should auto-clear to rejected.',
      },
      {
        issue: 'My Trips does not show expected match.',
        likelyCause: 'Outcome is still pending or filtered out.',
        fix: 'Check history tabs, then review one-off offer history for status details.',
      },
    ],
    statusGuide: [
      { status: 'PENDING', meaning: 'Request/offer waiting for decision.', nextAction: 'Process quickly to reduce queue buildup.' },
      { status: 'ACCEPTED', meaning: 'Decision approved and match path established.', nextAction: 'Confirm meeting point and route info.' },
      { status: 'REJECTED', meaning: 'Decision declined.', nextAction: 'Move to next request or adjust selection criteria.' },
      { status: 'OPEN', meaning: 'Ride/request still open for incoming responses.', nextAction: 'Respond while seats and time allow.' },
      { status: 'CLOSED', meaning: 'Offer/request no longer available.', nextAction: 'Do not submit further decisions on this item.' },
      { status: 'CONFIRMED', meaning: 'RideMatch exists and trip is scheduled.', nextAction: 'Prepare for execution and post-trip review.' },
    ],
    quiz: [
      {
        id: 'd1',
        question: 'What is required when accepting a join request?',
        options: ['Only rider name', 'Meeting point is required', 'No field is required', 'Admin approval first'],
        answer: 1,
        explain: 'Meeting point is mandatory for acceptance path.',
      },
      {
        id: 'd2',
        question: 'Can one driver have multiple pending offers for the same ride request?',
        options: ['Yes', 'No', 'Only on weekends', 'Only if rider agrees in chat'],
        answer: 1,
        explain: 'System blocks duplicate pending offers for same driver-request pair.',
      },
      {
        id: 'd3',
        question: 'Which condition can block one-off offer submission?',
        options: ['Driver unverified or inactive', 'High rating', 'Profile bio present', 'Trip date exists'],
        answer: 0,
        explain: 'Driver eligibility checks include account state and verification.',
      },
      {
        id: 'd4',
        question: 'What happens when accepted decision makes seats reach zero?',
        options: ['Offer remains OPEN forever', 'Offer closes and stale pending can be cleared', 'Driver is logged out', 'All requests become accepted'],
        answer: 1,
        explain: 'Seat exhaustion closes offer and pending cleanup logic applies.',
      },
      {
        id: 'd5',
        question: 'Where should confirmed outcomes be reviewed?',
        options: ['Only Login page', 'My Trips confirmed list', 'Register page', 'Intro FAQ'],
        answer: 1,
        explain: 'Confirmed matches are tracked in My Trips.',
      },
    ],
    actions: [
      { label: 'Open Driver Hub', to: '/driver-hub' },
      { label: 'Open My Trips', to: '/my-trips', secondary: true },
      { label: 'Open Profile', to: '/profile', secondary: true },
    ],
  },
  {
    id: 'ADMIN',
    label: 'Admin Tutorial',
    duration: '12-18 min practical training',
    objective: 'Operate governance workflows: verification, data quality, batch edits, and lifecycle oversight.',
    formats: ['Governance runbook', 'Batch operation flow', 'Audit checklist', 'Troubleshooting', 'Knowledge quiz'],
    checklist: [
      'I can access admin only via fixed account login path.',
      'I can review and update driver verification records.',
      'I can use pagination + bulk update safely.',
      'I can keep join requests and ride matches audit-ready.',
      'I can interpret rating data including rater and target context.',
      'I can make updates without breaking role-specific lifecycle rules.',
    ],
    decisions: [
      {
        title: 'Driver documents incomplete or unclear',
        recommendation: 'Keep verification at PENDING/REJECTED with specific notes.',
        action: '/admin',
      },
      {
        title: 'User account causes repeated invalid requests',
        recommendation: 'Adjust account status via controlled admin update.',
        action: '/admin',
      },
      {
        title: 'Data mismatch across histories',
        recommendation: 'Audit Join Requests and Ride Matches in separate panels.',
        action: '/admin',
      },
    ],
    steps: [
      {
        title: 'Enter secure admin access path',
        goal: 'Use controlled governance entry only.',
        actions: [
          'Open /admin/login.',
          'Sign in with fixed admin credentials.',
          'Confirm dashboard session is active before editing data.',
        ],
        systemSignals: [
          'Admin route opens only with admin session.',
          'Regular login/register does not create admin accounts.',
        ],
        ifBlocked: 'If redirected, verify session key validity and re-login.',
      },
      {
        title: 'Audit critical operational entities',
        goal: 'Maintain consistency across user, request, and match lifecycle.',
        actions: [
          'Review Users, Ride Offers, Ride Requests, Join Requests, Ride Matches.',
          'Inspect driver document records and verification notes.',
          'Validate rating context includes both rater and target.',
        ],
        systemSignals: [
          'Entity tables are separated for cleaner governance.',
          'Pagination supports high-volume review.',
        ],
        ifBlocked: 'If data appears stale, refresh overview then revisit target table.',
      },
      {
        title: 'Apply updates with minimal risk',
        goal: 'Use batch edits without violating business semantics.',
        actions: [
          'Use inline edit for single-record correction.',
          'Use batch update for repetitive status operations.',
          'Confirm result feedback before moving to next table.',
        ],
        systemSignals: [
          'Success/error messages returned after each update operation.',
          'Changed rows reflect new status immediately.',
        ],
        ifBlocked: 'If update conflicts, validate target status transitions are allowed.',
      },
      {
        title: 'Close the audit loop',
        goal: 'Ensure decisions remain explainable to reviewers/markers.',
        actions: [
          'Cross-check Join Request and Ride Match records.',
          'Review unmatched or stale pending data.',
          'Record verification notes for rejected document cases.',
        ],
        systemSignals: [
          'Join request outcomes and matches can be traced by ids.',
          'Ratings include both rater and target user context.',
        ],
        ifBlocked: 'If traceability is unclear, inspect related ids in adjacent admin tables.',
      },
    ],
    tasks: [
      {
        title: 'Task A: Verify newly registered driver',
        whenToUse: 'Driver uploaded required licence/seat/rego documents.',
        inputs: 'Document paths, account info, verification notes',
        actions: [
          'Open admin user or driver verification section.',
          'Review files and metadata.',
          'Set verification status and add notes.',
        ],
        doneWhen: 'Driver status reflects VERIFIED or REJECTED with rationale.',
      },
      {
        title: 'Task B: Bulk account status correction',
        whenToUse: 'Multiple users need ACTIVE/INACTIVE/SUSPENDED updates.',
        inputs: 'Selected user ids + target status',
        actions: [
          'Use bulk selector and status action.',
          'Apply update and monitor confirmation message.',
          'Re-check updated users in table.',
        ],
        doneWhen: 'All selected users show intended account status.',
      },
      {
        title: 'Task C: Lifecycle consistency audit',
        whenToUse: 'Need to validate request-to-match chain.',
        inputs: 'JoinRequest id / RideRequestOffer id / RideMatch id',
        actions: [
          'Open Join Requests panel and capture key ids.',
          'Open Ride Matches panel and verify accepted source linkage.',
          'Confirm no duplicate final matches for same source.',
        ],
        doneWhen: 'Trace chain is complete and constraints are respected.',
      },
      {
        title: 'Task D: Trust data governance',
        whenToUse: 'Need to inspect rating quality and moderation context.',
        inputs: 'Rating score/comment/rater/target',
        actions: [
          'Review ratings list and suspicious comments.',
          'Verify rater/target user links are valid.',
          'Apply moderation updates if required.',
        ],
        doneWhen: 'Ratings remain coherent and tied to valid users/profiles.',
      },
    ],
    demo: [
      {
        minute: '00:00',
        presenterLine: 'Show dedicated admin login entry.',
        operatorAction: 'Open /admin/login and authenticate.',
        expectedResult: 'Admin dashboard loads with overview metrics.',
      },
      {
        minute: '01:30',
        presenterLine: 'Review user governance controls.',
        operatorAction: 'Navigate users table and update one account status.',
        expectedResult: 'Inline update result message appears.',
      },
      {
        minute: '03:00',
        presenterLine: 'Demonstrate driver verification workflow.',
        operatorAction: 'Open driver records and inspect document fields.',
        expectedResult: 'Verification state can be set with notes.',
      },
      {
        minute: '05:00',
        presenterLine: 'Audit join requests and ride matches separately.',
        operatorAction: 'Open both panels and compare linked ids.',
        expectedResult: 'Accepted source relationship is traceable.',
      },
      {
        minute: '07:00',
        presenterLine: 'Apply a batch status update.',
        operatorAction: 'Select multiple rows and execute batch action.',
        expectedResult: 'Bulk update feedback confirms success/fail count.',
      },
      {
        minute: '09:00',
        presenterLine: 'Close with trust data controls.',
        operatorAction: 'Inspect ratings list with rater and target context.',
        expectedResult: 'Trust governance appears complete and auditable.',
      },
    ],
    troubleshooting: [
      {
        issue: 'Cannot enter /admin page after login.',
        likelyCause: 'Session is not admin or session expired.',
        fix: 'Re-open /admin/login and authenticate with fixed admin account.',
      },
      {
        issue: 'Driver actions blocked despite active account.',
        likelyCause: 'Licence verification still pending/rejected.',
        fix: 'Review document evidence and update verification status with notes.',
      },
      {
        issue: 'Bulk update did not affect all selected rows.',
        likelyCause: 'Some rows fail validation or selection changed across pagination.',
        fix: 'Re-apply on failed ids only and verify selection scope before submit.',
      },
      {
        issue: 'Join request and ride match seem inconsistent.',
        likelyCause: 'Looking at different lifecycle paths (join vs one-off).',
        fix: 'Trace acceptedJoinRequest or acceptedRideRequestOffer relation by id.',
      },
      {
        issue: 'Rating appears without clear actor context.',
        likelyCause: 'Wrong table/filter view.',
        fix: 'Use ratings panel showing rater and target columns together.',
      },
    ],
    statusGuide: [
      { status: 'ACTIVE', meaning: 'User account can operate normally.', nextAction: 'Keep monitoring abnormal behavior or complaints.' },
      { status: 'INACTIVE', meaning: 'Account is temporarily disabled from normal operation.', nextAction: 'Re-activate only when issue is resolved.' },
      { status: 'SUSPENDED', meaning: 'Account blocked due to policy/quality issue.', nextAction: 'Require review before any reactivation.' },
      { status: 'VERIFIED', meaning: 'Driver verification passed.', nextAction: 'Driver can participate in protected offer flows.' },
      { status: 'PENDING', meaning: 'Awaiting admin decision or user action.', nextAction: 'Prioritize review to avoid operational backlog.' },
      { status: 'REJECTED', meaning: 'Submission/decision declined.', nextAction: 'Add clear reason and expected remediation path.' },
    ],
    quiz: [
      {
        id: 'a1',
        question: 'How is admin access designed in this project?',
        options: ['Public registration for admin', 'Fixed-account login only', 'Social login only', 'No login required'],
        answer: 1,
        explain: 'Admin is intentionally fixed-account only; registration path is disabled.',
      },
      {
        id: 'a2',
        question: 'What is the safest way to handle large status updates?',
        options: ['Manual DB edits only', 'Use batch tools with verification', 'Ignore validation', 'Delete all and reseed'],
        answer: 1,
        explain: 'Batch tools are built for this use case with controlled feedback.',
      },
      {
        id: 'a3',
        question: 'Which records should be reviewed together for lifecycle audit?',
        options: ['Join Requests and Ride Matches', 'Only Profiles', 'Only Login logs', 'Only CSS files'],
        answer: 0,
        explain: 'Final matching trace requires both decision source and match records.',
      },
      {
        id: 'a4',
        question: 'Driver verification decision should include what?',
        options: ['Only color theme', 'Only seat number', 'Status plus verification notes', 'No metadata'],
        answer: 2,
        explain: 'Notes improve governance quality and audit explainability.',
      },
      {
        id: 'a5',
        question: 'How is trust actor context represented in ratings?',
        options: ['Target only', 'Rater only', 'Both rater and target', 'Neither'],
        answer: 2,
        explain: 'Ratings include both rater and target relationships.',
      },
    ],
    actions: [
      { label: 'Open Admin Login', to: '/admin/login' },
      { label: 'Open Admin Dashboard', to: '/admin', secondary: true },
      { label: 'Back to Intro', to: '/intro', secondary: true },
    ],
  },
];

function statusClassName(status) {
  const value = String(status || '').toUpperCase();
  if (value.includes('PENDING')) {
    return 'status-pill is-pending';
  }
  if (value.includes('ACCEPT') || value.includes('VERIFIED') || value.includes('ACTIVE') || value.includes('CONFIRMED') || value.includes('MATCHED')) {
    return 'status-pill is-positive';
  }
  if (value.includes('REJECT') || value.includes('SUSPEND') || value.includes('INACTIVE') || value.includes('CLOSED') || value.includes('CANCELLED')) {
    return 'status-pill is-warning';
  }
  return 'status-pill';
}

function buildCheatSheet(guide) {
  const lines = [];
  lines.push(`NeighbourLink ${guide.label} - 1-page Cheat Sheet`);
  lines.push('');
  lines.push(`Objective: ${guide.objective}`);
  lines.push(`Duration: ${guide.duration}`);
  lines.push('');
  lines.push('Core Checklist:');
  guide.checklist.forEach((item, index) => {
    lines.push(`${index + 1}. ${item}`);
  });
  lines.push('');
  lines.push('Guided Steps:');
  guide.steps.forEach((step, index) => {
    lines.push(`${index + 1}. ${step.title}`);
    lines.push(`Goal: ${step.goal}`);
    lines.push(`If blocked: ${step.ifBlocked}`);
  });
  lines.push('');
  lines.push('Status Decoder:');
  guide.statusGuide.forEach((item) => {
    lines.push(`- ${item.status}: ${item.meaning} -> ${item.nextAction}`);
  });
  lines.push('');
  lines.push('Quick Actions:');
  guide.actions.forEach((item) => {
    lines.push(`- ${item.label} (${item.to})`);
  });
  return lines.join('\n');
}

function TutorialPage() {
  const { isAuthenticated } = useAuth();
  const [guideId, setGuideId] = useState('RIDER');
  const [modeId, setModeId] = useState('GUIDED');
  const [checklistProgressByGuide, setChecklistProgressByGuide] = useState({});
  const [openIssueIndex, setOpenIssueIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const currentGuide = tutorialGuides.find((item) => item.id === guideId) || tutorialGuides[0];
  const checklistState = checklistProgressByGuide[guideId] || {};
  const completedChecklistCount = currentGuide.checklist.reduce(
    (count, _item, index) => (checklistState[index] ? count + 1 : count),
    0,
  );
  const checklistProgress = currentGuide.checklist.length === 0
    ? 0
    : Math.round((completedChecklistCount / currentGuide.checklist.length) * 100);
  const activeMode = modeTabs.find((tab) => tab.id === modeId) || modeTabs[0];
  const recommendedFocus = checklistProgress < 35
    ? {
        modeId: 'GUIDED',
        title: 'Start with Guided Path',
        detail: 'Run the full scenario once before jumping into shortcuts.',
      }
    : checklistProgress < 70
      ? {
          modeId: 'TASKS',
          title: 'Switch to Task Playbooks',
          detail: 'Practice repeatable workflows and complete operational cards.',
        }
      : {
          modeId: 'QUIZ',
          title: 'Validate with Knowledge Check',
          detail: 'Finish with troubleshooting + quiz to confirm delivery readiness.',
        };
  const progressTone = checklistProgress >= 80 ? 'is-high' : checklistProgress >= 45 ? 'is-mid' : 'is-low';
  const quickStats = [
    { label: 'Guided Steps', value: currentGuide.steps.length, hint: 'scenario checkpoints' },
    { label: 'Task Cards', value: currentGuide.tasks.length, hint: 'repeatable actions' },
    { label: 'Demo Cues', value: currentGuide.demo.length, hint: 'presentation timeline' },
    { label: 'Troubleshoot Cases', value: currentGuide.troubleshooting.length, hint: 'issue/fix pairs' },
    { label: 'Quiz Questions', value: currentGuide.quiz.length, hint: 'final validation' },
  ];
  const quizScore = useMemo(
    () => currentGuide.quiz.reduce((score, question) => (
      Number(quizAnswers[question.id]) === question.answer ? score + 1 : score
    ), 0),
    [currentGuide.quiz, quizAnswers],
  );
  const learningPhases = [
    {
      title: 'Discover',
      detail: 'Understand flow and trust checkpoints.',
      done: checklistProgress >= 35,
    },
    {
      title: 'Practice',
      detail: 'Execute key tasks and demo script.',
      done: checklistProgress >= 70,
    },
    {
      title: 'Validate',
      detail: 'Troubleshoot confidently and pass quiz.',
      done: quizSubmitted && quizScore >= Math.ceil(currentGuide.quiz.length * 0.7),
    },
  ];

  useEffect(() => {
    setModeId('GUIDED');
    setOpenIssueIndex(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setCopyFeedback('');
  }, [guideId]);

  function toggleChecklist(index) {
    setChecklistProgressByGuide((prev) => ({
      ...prev,
      [guideId]: {
        ...(prev[guideId] || {}),
        [index]: !prev[guideId]?.[index],
      },
    }));
  }

  function updateQuizAnswer(questionId, optionIndex) {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  }

  function handleQuizSubmit(event) {
    event.preventDefault();
    setQuizSubmitted(true);
  }

  function handleQuizReset() {
    setQuizAnswers({});
    setQuizSubmitted(false);
  }

  async function handleCopyCheatSheet() {
    const text = buildCheatSheet(currentGuide);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopyFeedback('Cheat sheet copied to clipboard.');
    } catch {
      setCopyFeedback('Copy failed. You can still use this page as your full guide.');
    }
  }

  return (
    <div className="intro-shell intro-shell-rich">
      <header className="intro-nav">
        <div className="intro-nav-inner">
          <Link className="brand" to={isAuthenticated ? '/' : '/intro'}>
            <span className="brand-mark">NL</span>
            <span className="brand-text">
              <strong>NeighbourLink</strong>
              <span className="brand-subtitle">Tutorial Center</span>
            </span>
          </Link>
          <div className="intro-nav-links is-open">
            <Link className="intro-link" to="/intro">Intro</Link>
            {isAuthenticated ? <Link className="btn" to="/">Open App</Link> : <Link className="btn" to="/login">Log In</Link>}
          </div>
        </div>
      </header>

      <main className="intro-main intro-main-rich">
        <section className="intro-section tutorial-master tutorial-master-rich">
          <h2 className="intro-section-title">Tutorial Training Center</h2>
          <p className="intro-section-subtitle">
            High-depth, practical onboarding with multiple delivery styles: guided steps, task playbooks, demo script,
            troubleshooting map, and quiz-based validation.
          </p>

          <div className="tutorial-top-grid">
            <aside className="tutorial-sidebar tutorial-sidebar-rich">
              <div>
                <p className="tutorial-label">Choose Tutorial Track</p>
                <div className="tutorial-role-list">
                  {tutorialGuides.map((guide) => (
                    <button
                      key={guide.id}
                      type="button"
                      className={`tutorial-role-btn ${guideId === guide.id ? 'active' : ''}`}
                      onClick={() => setGuideId(guide.id)}
                    >
                      {guide.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tutorial-journey-card">
                <p className="tutorial-label">Training Path</p>
                <ol className="tutorial-journey-list">
                  {learningPhases.map((phase) => (
                    <li key={phase.title} className={`tutorial-journey-item ${phase.done ? 'is-done' : ''}`}>
                      <span className="tutorial-journey-dot" aria-hidden />
                      <div>
                        <p className="tutorial-journey-title">{phase.title}</p>
                        <p className="tutorial-journey-detail">{phase.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className={`tutorial-progress-card ${progressTone}`}>
                <div className="tutorial-progress-head">
                  <strong>Training Progress</strong>
                  <span>{checklistProgress}%</span>
                </div>
                <div className="tutorial-progress-bar">
                  <span className="tutorial-progress-fill" style={{ width: `${checklistProgress}%` }} />
                </div>
                <p className="tutorial-progress-meta">
                  {completedChecklistCount}/{currentGuide.checklist.length} readiness items completed.
                </p>
                <ul className="tutorial-checklist">
                  {currentGuide.checklist.map((item, index) => (
                    <li key={item}>
                      <label>
                        <input
                          type="checkbox"
                          checked={Boolean(checklistState[index])}
                          onChange={() => toggleChecklist(index)}
                        />
                        <span>{item}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <article className="tutorial-board tutorial-board-rich">
              <header className="tutorial-board-head">
                <p className="tutorial-pill">{currentGuide.duration}</p>
                <h3>{currentGuide.label}</h3>
                <p>{currentGuide.objective}</p>
              </header>

              <div className="tutorial-spotlight-card">
                <div className="tutorial-spotlight-copy">
                  <p className="tutorial-spotlight-meta">Current module: {activeMode.title}</p>
                  <p className="tutorial-spotlight-label">Recommended Next Module</p>
                  <p className="tutorial-spotlight-title">{recommendedFocus.title}</p>
                  <p>{recommendedFocus.detail}</p>
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setModeId(recommendedFocus.modeId)}
                >
                  Jump to {modeTabs.find((tab) => tab.id === recommendedFocus.modeId)?.title || 'Module'}
                </button>
              </div>

              <div className="tutorial-metric-grid">
                {quickStats.map((item) => (
                  <article key={item.label} className="tutorial-metric-item">
                    <p className="tutorial-metric-value">{item.value}</p>
                    <p className="tutorial-metric-label">{item.label}</p>
                    <p className="tutorial-metric-hint">{item.hint}</p>
                  </article>
                ))}
              </div>

              <div className="tutorial-format-row">
                {currentGuide.formats.map((format) => (
                  <span key={format} className="tutorial-format-pill">{format}</span>
                ))}
              </div>

              <div className="tutorial-cta">
                <button className="btn btn-secondary" type="button" onClick={handleCopyCheatSheet}>
                  Copy 1-Page Cheat Sheet
                </button>
                {copyFeedback ? <span className="tutorial-copy-feedback">{copyFeedback}</span> : null}
              </div>

              <div className="tutorial-cta">
                {currentGuide.actions.map((action) => (
                  <Link
                    key={action.label}
                    className={action.secondary ? 'btn btn-secondary' : 'btn'}
                    to={action.to}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </article>
          </div>

          <div className="tutorial-mode-tabs">
            {modeTabs.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                className={`tutorial-mode-btn ${modeId === tab.id ? 'active' : ''}`}
                onClick={() => setModeId(tab.id)}
              >
                <span className="mode-head">
                  <span className="mode-chip">{String(index + 1).padStart(2, '0')}</span>
                  {modeId === tab.id ? <span className="mode-active-mark">Now</span> : null}
                </span>
                <span className="mode-title">{tab.title}</span>
                <span className="mode-desc">{tab.description}</span>
              </button>
            ))}
          </div>

          {modeId === 'GUIDED' ? (
            <div className="tutorial-guided-grid">
              <article className="tutorial-card">
                <h4>Decision Cards</h4>
                <div className="tutorial-decision-grid">
                  {currentGuide.decisions.map((decision) => (
                    <div key={decision.title} className="tutorial-decision-card">
                      <p className="tutorial-card-title">{decision.title}</p>
                      <p>{decision.recommendation}</p>
                      <Link className="btn btn-secondary" to={decision.action}>Open Relevant Page</Link>
                    </div>
                  ))}
                </div>
              </article>

              <article className="tutorial-card">
                <h4>Guided Scenario Steps</h4>
                <ol className="tutorial-step-list">
                  {currentGuide.steps.map((step, idx) => (
                    <li key={step.title} className="tutorial-step-card">
                      <span className="tutorial-step-index">Step {idx + 1}</span>
                      <div className="tutorial-step-content">
                        <h5>{step.title}</h5>
                        <p className="tutorial-step-goal"><strong>Goal:</strong> {step.goal}</p>
                        <p><strong>User Actions</strong></p>
                        <ul className="tutorial-mini-list">
                          {step.actions.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                        <p><strong>System Checkpoints</strong></p>
                        <ul className="tutorial-mini-list">
                          {step.systemSignals.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                        <p className="tutorial-step-block"><strong>If blocked:</strong> {step.ifBlocked}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            </div>
          ) : null}

          {modeId === 'TASKS' ? (
            <div className="tutorial-task-grid">
              {currentGuide.tasks.map((task) => (
                <article key={task.title} className="tutorial-card tutorial-task-card">
                  <h4>{task.title}</h4>
                  <p><strong>When to use:</strong> {task.whenToUse}</p>
                  <p><strong>Inputs:</strong> {task.inputs}</p>
                  <p><strong>Execution:</strong></p>
                  <ol className="tutorial-mini-list ordered">
                    {task.actions.map((action) => <li key={action}>{action}</li>)}
                  </ol>
                  <p className="tutorial-step-goal"><strong>Done when:</strong> {task.doneWhen}</p>
                </article>
              ))}
            </div>
          ) : null}

          {modeId === 'DEMO' ? (
            <div className="tutorial-demo-list">
              {currentGuide.demo.map((item) => (
                <article key={`${item.minute}-${item.presenterLine}`} className="tutorial-card tutorial-demo-item">
                  <div className="tutorial-demo-time">{item.minute}</div>
                  <div className="tutorial-demo-content">
                    <p><strong>Presenter line:</strong> {item.presenterLine}</p>
                    <p><strong>Operator action:</strong> {item.operatorAction}</p>
                    <p><strong>Expected result:</strong> {item.expectedResult}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {modeId === 'TROUBLESHOOT' ? (
            <div className="tutorial-trouble-list">
              {currentGuide.troubleshooting.map((item, index) => (
                <article key={item.issue} className="tutorial-card tutorial-trouble-item">
                  <button
                    type="button"
                    className="tutorial-trouble-toggle"
                    onClick={() => setOpenIssueIndex(openIssueIndex === index ? -1 : index)}
                  >
                    <span>{item.issue}</span>
                    <span>{openIssueIndex === index ? '-' : '+'}</span>
                  </button>
                  {openIssueIndex === index ? (
                    <div className="tutorial-trouble-body">
                      <p><strong>Likely cause:</strong> {item.likelyCause}</p>
                      <p><strong>How to fix:</strong> {item.fix}</p>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          {modeId === 'QUIZ' ? (
            <form className="tutorial-quiz-form" onSubmit={handleQuizSubmit}>
              {currentGuide.quiz.map((question, idx) => (
                <article key={question.id} className="tutorial-card tutorial-question-card">
                  <p className="tutorial-card-title">Q{idx + 1}. {question.question}</p>
                  <div className="tutorial-option-list">
                    {question.options.map((option, optionIndex) => (
                      <label key={option} className="tutorial-option-item">
                        <input
                          type="radio"
                          name={`quiz-${question.id}`}
                          checked={Number(quizAnswers[question.id]) === optionIndex}
                          onChange={() => updateQuizAnswer(question.id, optionIndex)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {quizSubmitted ? (
                    <p className={Number(quizAnswers[question.id]) === question.answer ? 'status-success' : 'status-note'}>
                      {Number(quizAnswers[question.id]) === question.answer ? 'Correct.' : 'Not correct yet.'} {question.explain}
                    </p>
                  ) : null}
                </article>
              ))}
              <div className="tutorial-cta">
                <button className="btn" type="submit">Submit Answers</button>
                <button className="btn btn-secondary" type="button" onClick={handleQuizReset}>Reset Quiz</button>
                {quizSubmitted ? (
                  <p className="tutorial-quiz-score">
                    Score: {quizScore}/{currentGuide.quiz.length}
                  </p>
                ) : null}
              </div>
            </form>
          ) : null}

          <section className="tutorial-card tutorial-status-card">
            <h4>Status Decoder and Next Action</h4>
            <p className="status-note">
              Use this table to explain lifecycle state transitions to users during onboarding or demo.
            </p>
            <div className="tutorial-status-table-wrap">
              <table className="tutorial-status-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Meaning</th>
                    <th>Next Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentGuide.statusGuide.map((item) => (
                    <tr key={item.status}>
                      <td><span className={statusClassName(item.status)}>{item.status}</span></td>
                      <td>{item.meaning}</td>
                      <td>{item.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default TutorialPage;

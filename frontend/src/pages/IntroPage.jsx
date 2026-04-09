import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const showcaseImages = {
  city: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1800&q=80',
  carpool: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80',
  route: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1600&q=80',
  team: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
  admin: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
  trust: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80',
};

const capabilityCards = [
  {
    title: 'Fast Rider Search',
    detail: 'Search available ride offers with route context, date, and seats in one simple flow.',
  },
  {
    title: 'Join Request Lifecycle',
    detail: 'Submit, validate, accept or reject join requests with explicit status transitions.',
  },
  {
    title: 'One-Off Request Matching',
    detail: 'Rider posts one-off trip need, drivers respond, rider accepts one final offer.',
  },
  {
    title: 'Trust Before Acceptance',
    detail: 'Profile plus rating summary is shown before critical acceptance decisions.',
  },
  {
    title: 'Driver Verification Docs',
    detail: 'Licence, spare seat proof, and rego files are uploaded and reviewed in admin.',
  },
  {
    title: 'Admin Global Operations',
    detail: 'Single admin console supports pagination, batch updates, and broad data governance.',
  },
];

const useCases = [
  {
    id: 'UC1',
    title: 'Search Available Ride Offers',
    summary: 'Rider discovers matching options and inspects trust info before requesting seats.',
    flow: [
      'Enter search criteria on Find a Ride.',
      'Review result cards and select one offer.',
      'Inspect driver profile and rating summary.',
      'Submit request only when seats and status allow.',
    ],
  },
  {
    id: 'UC2',
    title: 'Request to Join Ride Offer',
    summary: 'Driver reviews rider request, accepts or rejects, and the system creates a valid match.',
    flow: [
      'Driver Hub lists pending join requests.',
      'Decision requires meeting point on acceptance.',
      'Seat count updates instantly after acceptance.',
      'Pending requests can be cleared to avoid stale outcomes.',
    ],
  },
  {
    id: 'UC3',
    title: 'Post One-Off Request and Accept Driver Offer',
    summary: 'Rider posts once, receives multiple offers, then confirms exactly one accepted path.',
    flow: [
      'Rider posts one-off request with route details.',
      'Drivers submit seat-capable offers with meeting points.',
      'Rider reviews trust and offer history context.',
      'Accepting one offer creates final RideMatch and closes request.',
    ],
  },
];

const journeyPanels = [
  {
    id: 'rider',
    label: 'Rider Experience',
    title: 'From need to confirmation in a short, readable flow',
    description:
      'Rider pages focus on clarity: search, compare, inspect trust, request, then confirm without extra noise.',
    points: [
      'Ride Offer Details surfaces trust notes and ratings before action.',
      'One-off flow enforces one final accepted offer for clean outcomes.',
      'My Trips keeps confirmed records visible for post-decision certainty.',
    ],
    image: showcaseImages.carpool,
  },
  {
    id: 'driver',
    label: 'Driver Experience',
    title: 'Driver Hub centralizes operational decisions',
    description:
      'Drivers process normal join requests and one-off responses from one dashboard with clear state feedback.',
    points: [
      'Meeting point entry is required when confirming requests.',
      'Open one-off requests include map context for better pickup decisions.',
      'Driver offer history prevents duplicate pending responses.',
    ],
    image: showcaseImages.route,
  },
  {
    id: 'admin',
    label: 'Admin Experience',
    title: 'Single-role admin with strong data control',
    description:
      'A fixed admin login enters a purpose-built control panel for user, ride, trust, and verification operations.',
    points: [
      'Pagination and batch edits speed up high-volume updates.',
      'Driver verification files are reviewable with status control.',
      'Join requests and ride matches are split for clearer governance.',
    ],
    image: showcaseImages.admin,
  },
];

const tutorialGuides = [
  {
    id: 'RIDER',
    label: 'Rider Tutorial',
    duration: '2-3 min walkthrough',
    objective: 'Find the best ride, send a join request, and track status clearly in My Trips.',
    checklist: [
      'Set accurate suburb names for better search matching.',
      'Confirm trip date before searching or posting.',
    ],
    steps: [
      {
        title: 'Open Find a Ride and fill the 3-step flow',
        detail: 'Set Origin, then Destination, then Trip Date. Press Confirm to submit the search flow.',
      },
      {
        title: 'Review trust before requesting seats',
        detail: 'Open Ride Offer Details, inspect profile and rating summary, then submit Join Request.',
      },
      {
        title: 'Track outcomes in My Trips',
        detail: 'Use My Join Request History tabs (Pending, Accepted, Rejected, All) and submit review after completed trips.',
      },
    ],
    actions: [
      { label: 'Start Find a Ride', to: '/' },
      { label: 'Post One-Off Request', to: '/post-ride-request', secondary: true },
    ],
  },
  {
    id: 'DRIVER',
    label: 'Driver Tutorial',
    duration: '2-4 min walkthrough',
    objective: 'Process join requests, respond to one-off requests, and keep offers consistent.',
    checklist: [
      'Ensure licence verification is approved.',
      'Keep meeting point details specific for accepted requests.',
    ],
    steps: [
      {
        title: 'Go to Driver Hub',
        detail: 'Review pending join requests first. Accept requires meeting point; reject clears stale intent.',
      },
      {
        title: 'Respond to open one-off requests',
        detail: 'Check map location and rider context, then submit one pending offer per request.',
      },
      {
        title: 'Check My Trips and offer history',
        detail: 'Confirmed matches appear in Trip Results while offer lifecycle stays in one-off offer history.',
      },
    ],
    actions: [
      { label: 'Open Driver Hub', to: '/driver-hub' },
      { label: 'Open My Trips', to: '/my-trips', secondary: true },
    ],
  },
  {
    id: 'ADMIN',
    label: 'Admin Tutorial',
    duration: '3-5 min walkthrough',
    objective: 'Use fixed-account admin access to govern users, rides, verification, and trust records.',
    checklist: [
      'Sign in via dedicated admin login URL.',
      'Use pagination and batch tools for high-volume updates.',
    ],
    steps: [
      {
        title: 'Enter admin login',
        detail: 'Use fixed credentials at /admin/login. Registration for admin is intentionally disabled.',
      },
      {
        title: 'Review verification and ride operations',
        detail: 'Audit driver documents, join requests, ride matches, and request offers in dedicated panels.',
      },
      {
        title: 'Apply controlled updates',
        detail: 'Use inline edits and batch actions to update account status, verification states, and quality signals.',
      },
    ],
    actions: [
      { label: 'Open Admin Login', to: '/admin/login' },
      { label: 'Open Admin Dashboard', to: '/admin', secondary: true },
    ],
  },
];

const architecturePanels = [
  {
    title: 'Backend Foundations',
    entries: ['Java 17', 'Spring Boot', 'Spring Web', 'Spring Data JPA', 'Bean Validation', 'SQLite'],
  },
  {
    title: 'Frontend Foundations',
    entries: ['React + Vite', 'Role-based pages', 'Leaflet map integration', 'Responsive CSS breakpoints'],
  },
  {
    title: 'Core Domain Objects',
    entries: ['User', 'Rider', 'Driver', 'Profile', 'RideOffer', 'RideRequest', 'JoinRequest', 'RideMatch', 'Rating'],
  },
  {
    title: 'Enforced Business Rules',
    entries: [
      'No overbooking: requested seats must be valid.',
      'RideMatch is created only after explicit acceptance.',
      'Seat and request states are updated immediately.',
      'Trust info appears before confirmation actions.',
    ],
  },
];

const scopeRows = [
  {
    inScope: 'Search offers, join flow, one-off rider request flow',
    outScope: 'Payments, route optimization algorithms, live chat',
  },
  {
    inScope: 'Trust signals with profile and rating summary',
    outScope: 'Complex multi-role permission systems',
  },
  {
    inScope: 'Assignment-focused clear state transitions',
    outScope: 'Microservices and production-scale distributed architecture',
  },
];

const faqs = [
  {
    q: 'Does this site represent implemented behavior or only concept design?',
    a: 'This page introduces implemented behavior from your current codebase, including Rider, Driver Hub, and Admin control flows.',
  },
  {
    q: 'Why emphasize trust so much in the flow?',
    a: 'Your design requires trust checking before acceptance, so profile quality and rating visibility are treated as first-class UX elements.',
  },
  {
    q: 'Can reviewers quickly map this to UML and use cases?',
    a: 'Yes. The page explains the three approved use cases, domain model language, and key rules used in backend transitions.',
  },
];

function IntroPage() {
  const { isAuthenticated } = useAuth();
  const [activeJourney, setActiveJourney] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [tutorialGuideId, setTutorialGuideId] = useState('RIDER');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navActionsRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveJourney((prev) => (prev + 1) % journeyPanels.length);
    }, 6200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (!navActionsRef.current?.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  const currentJourney = journeyPanels[activeJourney];
  const currentTutorialGuide = useMemo(
    () => tutorialGuides.find((guide) => guide.id === tutorialGuideId) || tutorialGuides[0],
    [tutorialGuideId],
  );

  return (
    <div className="intro-shell intro-shell-rich">
      <header className="intro-nav">
        <div className="intro-nav-inner">
          <Link
            className="brand"
            to={isAuthenticated ? '/' : '/intro'}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="brand-mark">NL</span>
            <span className="brand-text">
              <strong>NeighbourLink</strong>
              <span className="brand-subtitle">Community Ride Matching</span>
            </span>
          </Link>
          <div className="intro-nav-actions" ref={navActionsRef}>
            <button
              className="intro-nav-toggle"
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="intro-nav-links"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? 'Close Menu' : 'Menu'}
            </button>
            <nav
              id="intro-nav-links"
              className={`intro-nav-links ${mobileMenuOpen ? 'is-open' : ''}`}
              aria-label="Intro sections"
              onClick={() => setMobileMenuOpen(false)}
            >
              <a className="intro-link" href="#overview">Overview</a>
              <Link className="intro-link" to="/tutorial">Tutorial</Link>
              <a className="intro-link" href="#capabilities">Capabilities</a>
              <a className="intro-link" href="#use-cases">Use Cases</a>
              <a className="intro-link" href="#architecture">Architecture</a>
              <a className="intro-link" href="#faq">FAQ</a>
              {isAuthenticated ? (
                <Link className="btn" to="/">Open App</Link>
              ) : (
                <>
                  <Link className="btn btn-secondary" to="/login">Log In</Link>
                  <Link className="btn" to="/register">Get Started</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="intro-main intro-main-rich">
        <section className="intro-hero intro-hero-rich" id="overview">
          <div className="intro-hero-grid intro-hero-grid-rich">
            <div>
              <span className="intro-kicker">NeighbourLink Product Showcase</span>
              <h1 className="intro-title">
                A fully polished static project site for your Rider, Driver, and Admin business flows.
              </h1>
              <p className="intro-lead">
                This page translates your implemented codebase into a high-quality story: business context,
                approved use cases, trust logic, architecture decisions, and admin governance experience.
              </p>
              <div className="intro-hero-actions">
                {isAuthenticated ? (
                  <Link className="btn" to="/">Go to Dashboard</Link>
                ) : (
                  <>
                    <Link className="btn" to="/login">Sign In</Link>
                    <Link className="btn btn-secondary" to="/register">Create Account</Link>
                  </>
                )}
              </div>
              <div className="intro-hero-points">
                <span>Three approved use cases presented end to end.</span>
                <span>Trust-first acceptance logic made explicit for reviewers.</span>
                <span>Backend and frontend responsibilities explained in one place.</span>
              </div>
            </div>

            <div className="intro-media intro-media-rich">
              <div className="intro-gallery">
                <img className="intro-gallery-main" src={showcaseImages.city} alt="Urban community mobility network" />
                <img className="intro-gallery-small" src={showcaseImages.team} alt="Community collaboration" />
                <img className="intro-gallery-small" src={showcaseImages.trust} alt="Trust and safety process" />
              </div>
              <div className="intro-stats intro-stats-rich">
                <article className="stat-card">
                  <strong>3</strong>
                  <span>Approved use cases</span>
                </article>
                <article className="stat-card">
                  <strong>9+</strong>
                  <span>Core domain entities surfaced</span>
                </article>
                <article className="stat-card">
                  <strong>1</strong>
                  <span>Admin role with full governance panel</span>
                </article>
                <article className="stat-card">
                  <strong>Mobile</strong>
                  <span>Responsive fit for 320px to desktop</span>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="intro-section intro-proof-strip">
          <article>
            <strong>Business Focus</strong>
            <p>Ride matching and confirmation with clear boundaries.</p>
          </article>
          <article>
            <strong>Trust Layer</strong>
            <p>Profile, rating, and verification integrated before acceptance.</p>
          </article>
          <article>
            <strong>Operational Clarity</strong>
            <p>Driver Hub and Admin Console keep state transitions explicit.</p>
          </article>
        </section>

        <section className="intro-section" id="tutorial">
          <h2 className="intro-section-title">Quick Start Tutorial</h2>
          <p className="intro-section-subtitle">
            Choose your role and follow an exact path to use the system correctly from the first click.
          </p>
          <div className="tutorial-shell">
            <aside className="tutorial-sidebar">
              <p className="tutorial-label">Choose Tutorial Track</p>
              <div className="tutorial-role-list">
                {tutorialGuides.map((guide) => (
                  <button
                    key={guide.id}
                    type="button"
                    className={`tutorial-role-btn ${tutorialGuideId === guide.id ? 'active' : ''}`}
                    onClick={() => setTutorialGuideId(guide.id)}
                  >
                    {guide.label}
                  </button>
                ))}
              </div>
              <div className="tutorial-note">
                <strong>Before You Start</strong>
                <ul>
                  {currentTutorialGuide.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </aside>
            <article className="tutorial-board">
              <header className="tutorial-board-head">
                <p className="tutorial-pill">{currentTutorialGuide.duration}</p>
                <h3>{currentTutorialGuide.label}</h3>
                <p>{currentTutorialGuide.objective}</p>
              </header>
              <ol className="tutorial-step-list">
                {currentTutorialGuide.steps.map((step, idx) => (
                  <li key={step.title} className="tutorial-step-card">
                    <span className="tutorial-step-index">Step {idx + 1}</span>
                    <div className="tutorial-step-content">
                      <h4>{step.title}</h4>
                      <p>{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="tutorial-cta">
                {currentTutorialGuide.actions.map((action) => (
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
        </section>

        <section className="intro-section" id="capabilities">
          <h2 className="intro-section-title">Capability Matrix</h2>
          <p className="intro-section-subtitle">
            A product-grade summary of what your current business code already supports.
          </p>
          <div className="intro-capability-grid">
            {capabilityCards.map((card) => (
              <article key={card.title} className="intro-capability-card">
                <h3>{card.title}</h3>
                <p>{card.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="intro-section" id="use-cases">
          <h2 className="intro-section-title">Approved Use Cases in Action</h2>
          <p className="intro-section-subtitle">
            Structured walkthrough aligned to your assignment scope and implementation language.
          </p>
          <div className="intro-usecase-grid">
            {useCases.map((item) => (
              <article key={item.id} className="intro-usecase-card">
                <p className="intro-usecase-id">{item.id}</p>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <ul>
                  {item.flow.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="intro-section" id="journeys">
          <h2 className="intro-section-title">Role Journey Showcase</h2>
          <p className="intro-section-subtitle">
            Tap each role to review responsibilities, UX priorities, and implemented outcomes.
          </p>
          <div className="story-tabs">
            {journeyPanels.map((panel, idx) => (
              <button
                key={panel.id}
                type="button"
                className={`story-chip ${idx === activeJourney ? 'active' : ''}`}
                onClick={() => setActiveJourney(idx)}
              >
                {panel.label}
              </button>
            ))}
          </div>
          <div className="intro-role-panel">
            <article className="intro-role-panel-content">
              <h3>{currentJourney.title}</h3>
              <p>{currentJourney.description}</p>
              <ul>
                {currentJourney.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
            <img className="intro-role-image" src={currentJourney.image} alt={`${currentJourney.label} visual`} />
          </div>
        </section>

        <section className="intro-section" id="architecture">
          <h2 className="intro-section-title">Architecture and Domain Alignment</h2>
          <p className="intro-section-subtitle">
            Technical snapshot for marker-friendly review: stack, rules, and domain vocabulary.
          </p>
          <div className="intro-architecture-grid">
            {architecturePanels.map((panel) => (
              <article key={panel.title} className="intro-architecture-card">
                <h3>{panel.title}</h3>
                <ul>
                  {panel.entries.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="intro-scope-table-wrap">
            <table className="intro-scope-table">
              <thead>
                <tr>
                  <th>In Scope</th>
                  <th>Out of Scope</th>
                </tr>
              </thead>
              <tbody>
                {scopeRows.map((row) => (
                  <tr key={`${row.inScope}-${row.outScope}`}>
                    <td>{row.inScope}</td>
                    <td>{row.outScope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="intro-section" id="faq">
          <h2 className="intro-section-title">Project FAQ</h2>
          <p className="intro-section-subtitle">
            Ready-to-use answers for tutor demo, viva discussion, and final review slides.
          </p>
          <div className="faq-list">
            {faqs.map((faq, idx) => {
              const expanded = openFaq === idx;
              return (
                <article className="faq-item" key={faq.q}>
                  <button
                    className="faq-trigger"
                    type="button"
                    onClick={() => setOpenFaq(expanded ? -1 : idx)}
                  >
                    {faq.q}
                    <span>{expanded ? '-' : '+'}</span>
                  </button>
                  {expanded ? <div className="faq-body">{faq.a}</div> : null}
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="intro-footer">
        NeighbourLink polished static showcase - built from your real business implementation
      </footer>
    </div>
  );
}

export default IntroPage;

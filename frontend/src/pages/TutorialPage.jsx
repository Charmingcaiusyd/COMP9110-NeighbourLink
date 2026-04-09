import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const tutorialGuides = [
  {
    id: 'RIDER',
    label: 'Rider Tutorial',
    duration: '2-3 min walkthrough',
    objective: 'Find the best ride, send a join request, and track status clearly in My Trips.',
    checklist: [
      'Set accurate suburb names for better matching.',
      'Confirm trip date before searching or posting.',
    ],
    steps: [
      {
        title: 'Open Find a Ride and finish the 3-step flow',
        detail: 'Set Origin, then Destination, then Trip Date. Press Confirm to submit search.',
      },
      {
        title: 'Review trust before seat request',
        detail: 'Open Ride Offer Details, check profile and ratings, then submit Join Request.',
      },
      {
        title: 'Track in My Trips',
        detail: 'Use My Join Request History tabs: Pending, Accepted, Rejected, and All.',
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
    objective: 'Process join requests, respond to one-off requests, and keep offer states clean.',
    checklist: [
      'Ensure licence verification is approved.',
      'Provide a clear meeting point for accepted requests.',
    ],
    steps: [
      {
        title: 'Open Driver Hub first',
        detail: 'Review pending join requests and decide quickly to avoid stale intent.',
      },
      {
        title: 'Respond to open one-off requests',
        detail: 'Use map context, then submit at most one pending offer per request.',
      },
      {
        title: 'Check My Trips and history',
        detail: 'Confirmed matches show in Trip Results, with offer lifecycle in one-off history.',
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
      'Sign in via dedicated /admin/login URL.',
      'Use pagination and batch operations for large updates.',
    ],
    steps: [
      {
        title: 'Enter admin login',
        detail: 'Admin can only sign in with fixed credentials. Registration is disabled by design.',
      },
      {
        title: 'Review verification and ride operations',
        detail: 'Audit driver documents, join requests, ride matches, and one-off offers.',
      },
      {
        title: 'Apply controlled updates',
        detail: 'Use inline edit and batch tools to keep account and trust data consistent.',
      },
    ],
    actions: [
      { label: 'Open Admin Login', to: '/admin/login' },
      { label: 'Open Admin Dashboard', to: '/admin', secondary: true },
    ],
  },
];

function TutorialPage() {
  const { isAuthenticated } = useAuth();
  const [guideId, setGuideId] = useState('RIDER');
  const currentGuide = tutorialGuides.find((item) => item.id === guideId) || tutorialGuides[0];

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
        <section className="intro-section">
          <h2 className="intro-section-title">Tutorial</h2>
          <p className="intro-section-subtitle">
            Role-based walkthroughs that teach users exactly how to use the system.
          </p>
          <div className="tutorial-shell">
            <aside className="tutorial-sidebar">
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
              <div className="tutorial-note">
                <strong>Before You Start</strong>
                <ul>
                  {currentGuide.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </aside>

            <article className="tutorial-board">
              <header className="tutorial-board-head">
                <p className="tutorial-pill">{currentGuide.duration}</p>
                <h3>{currentGuide.label}</h3>
                <p>{currentGuide.objective}</p>
              </header>
              <ol className="tutorial-step-list">
                {currentGuide.steps.map((step, idx) => (
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
        </section>
      </main>
    </div>
  );
}

export default TutorialPage;

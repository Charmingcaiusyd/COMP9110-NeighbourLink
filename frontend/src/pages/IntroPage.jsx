import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import communityPlaceholder from '../assets/placeholders/community-placeholder.svg';
import routePlaceholder from '../assets/placeholders/route-placeholder.svg';
import safetyPlaceholder from '../assets/placeholders/safety-placeholder.svg';

const featureCards = [
  {
    title: 'Trusted Match Flow',
    description: 'Review profile and rating summary before accepting any match.',
    image: safetyPlaceholder,
  },
  {
    title: 'Local One-Off Trips',
    description: 'Post a one-off request and accept one clear final driver offer.',
    image: routePlaceholder,
  },
  {
    title: 'Simple Rider Experience',
    description: 'From searching to confirmation, every page keeps the flow short and clear.',
    image: communityPlaceholder,
  },
];

const stories = [
  {
    id: 'rider',
    label: 'Rider Story',
    title: 'Maria posts one request and confirms one driver',
    points: [
      'Publish one-off request in less than 1 minute.',
      'Review all incoming offers in one list.',
      'Accept exactly one pending offer and generate a final match.',
    ],
    image: routePlaceholder,
  },
  {
    id: 'driver',
    label: 'Driver Story',
    title: 'Driver hub keeps decisions focused',
    points: [
      'Handle join requests and one-off responses in one dashboard.',
      'Meeting point is clear before final acceptance.',
      'Offer history helps drivers review what was accepted or rejected.',
    ],
    image: communityPlaceholder,
  },
  {
    id: 'trust',
    label: 'Trust Story',
    title: 'Trust checks are visible before confirmation',
    points: [
      'Driver detail page includes rating summary and trust notes.',
      'Profile update page lets users keep identity and notes current.',
      'My Trips records confirmed matches for both rider and driver.',
    ],
    image: safetyPlaceholder,
  },
];

const faqs = [
  {
    q: 'Is this a full marketplace with bidding and payments?',
    a: 'No. The design intentionally stays assignment-sized: no bidding, no payment, and one final accepted one-off match.',
  },
  {
    q: 'Can I cancel a one-off request later?',
    a: 'Yes. Riders can cancel unmatched OPEN one-off requests. Once MATCHED, cancellation is blocked to keep trip integrity.',
  },
  {
    q: 'Can both rider and driver see history?',
    a: 'Yes. My Trips shows confirmed matches, and one-off request/offer history is available for both roles.',
  },
];

function IntroPage() {
  const { isAuthenticated } = useAuth();
  const [activeStory, setActiveStory] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStory((prev) => (prev + 1) % stories.length);
    }, 5200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="intro-shell">
      <header className="intro-nav">
        <div className="intro-nav-inner">
          <Link className="brand" to={isAuthenticated ? '/' : '/intro'}>
            <span className="brand-mark">NL</span>
            <span className="brand-text">
              <strong>NeighbourLink</strong>
              Community Ride Matching
            </span>
          </Link>
          <nav className="intro-nav-links">
            <a href="#overview">Overview</a>
            <a href="#use-cases">Use Cases</a>
            <a href="#stories">Live Demo Flow</a>
            <a href="#faq">FAQ</a>
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
      </header>

      <main className="intro-main">
        <section className="intro-hero" id="overview">
          <div className="intro-hero-grid">
            <div>
              <span className="intro-kicker">Assignment-ready product demo</span>
              <h1 className="intro-title">NeighbourLink helps communities match rides faster and with clearer trust signals.</h1>
              <p className="intro-lead">
                This interface focuses on practical rider and driver workflows: search offers, request to join,
                post one-off requests, review offers, and confirm a single final match.
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
                <span>One-off request ends with one effective accepted match.</span>
                <span>Driver and rider can both review trip history.</span>
                <span>Profile and trust data remain visible before acceptance.</span>
              </div>
            </div>

            <div className="intro-media">
              <img className="intro-image" src={communityPlaceholder} alt="NeighbourLink introduction placeholder" />
              <div className="floating-note">
                <strong>Live status: Ready</strong>
                <small>Backend + Frontend running locally</small>
              </div>
              <div className="intro-stats">
                <article className="stat-card">
                  <strong>3</strong>
                  <span>Approved use cases</span>
                </article>
                <article className="stat-card">
                  <strong>1</strong>
                  <span>Final accepted one-off match</span>
                </article>
                <article className="stat-card">
                  <strong>2</strong>
                  <span>Roles: Rider + Driver</span>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="intro-section" id="use-cases">
          <h2 className="intro-section-title">Product Sections</h2>
          <p className="intro-section-subtitle">
            A unified visual style with placeholders ready for your final real images.
          </p>
          <div className="feature-grid">
            {featureCards.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <img src={feature.image} alt={`${feature.title} placeholder`} />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="intro-section" id="stories">
          <h2 className="intro-section-title">Interactive Demo Highlights</h2>
          <p className="intro-section-subtitle">
            Click each flow card. It also auto-rotates to create a lightweight interactive feel.
          </p>
          <div className="story-tabs">
            {stories.map((story, idx) => (
              <button
                key={story.id}
                type="button"
                className={`story-chip ${idx === activeStory ? 'active' : ''}`}
                onClick={() => setActiveStory(idx)}
              >
                {story.label}
              </button>
            ))}
          </div>
          <div className="story-panel">
            <article className="story-panel-content">
              <h3>{stories[activeStory].title}</h3>
              <ul>
                {stories[activeStory].points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
            <img className="intro-image" src={stories[activeStory].image} alt={`${stories[activeStory].label} placeholder`} />
          </div>
        </section>

        <section className="intro-section" id="faq">
          <h2 className="intro-section-title">Quick FAQ</h2>
          <p className="intro-section-subtitle">Simple collapsible answers for reviewers and tutors.</p>
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
        NeighbourLink demo interface - ready for your final image replacement and presentation
      </footer>
    </div>
  );
}

export default IntroPage;

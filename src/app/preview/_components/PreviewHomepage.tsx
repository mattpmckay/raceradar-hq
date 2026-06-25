import Link from 'next/link'
import { ArrowRight, Calendar, MapPin, Trophy, Radar } from 'lucide-react'

interface Scheme {
  name: string
  slug: string
  accent: string
  accentHover: string
  accentLight: string
  accentLighter: string
  accentBg: string
  accentCtaBg: string
}

const SCHEMES: Scheme[] = [
  {
    name: 'Electric Orange',
    slug: 'orange',
    accent: '#f97316',
    accentHover: '#ea580c',
    accentLight: '#fb923c',
    accentLighter: '#fdba74',
    accentBg: 'rgba(249,115,22,0.15)',
    accentCtaBg: 'rgba(249,115,22,0.20)',
  },
  {
    name: 'Neon Magenta',
    slug: 'magenta',
    accent: '#E4007C',
    accentHover: '#c0006a',
    accentLight: '#ff1a8f',
    accentLighter: '#ff66b8',
    accentBg: 'rgba(228,0,124,0.15)',
    accentCtaBg: 'rgba(228,0,124,0.20)',
  },
  {
    name: 'Electric Blue',
    slug: 'blue',
    accent: '#2563eb',
    accentHover: '#1d4ed8',
    accentLight: '#3b82f6',
    accentLighter: '#60a5fa',
    accentBg: 'rgba(37,99,235,0.15)',
    accentCtaBg: 'rgba(37,99,235,0.20)',
  },
]

export function PreviewHomepage({ currentSlug }: { currentSlug: string }) {
  const scheme = SCHEMES.find((s) => s.slug === currentSlug) ?? SCHEMES[0]

  return (
    <>
      <style>{`
        .pa-text   { color: ${scheme.accent}; }
        .pa-text-l { color: ${scheme.accentLight}; }
        .pa-text-ll{ color: ${scheme.accentLighter}; }
        .pa-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border-radius: 0.5rem;
          background-color: ${scheme.accent};
          padding: 0.75rem 1.5rem;
          font-size: 1rem; font-weight: 600;
          color: #fff; text-decoration: none;
          transition: background-color 0.15s;
        }
        .pa-btn:hover { background-color: ${scheme.accentHover}; }
        .pa-switcher-active {
          background-color: ${scheme.accent};
          color: #fff;
          border-radius: 9999px;
          padding: 0.25rem 0.875rem;
          font-size: 0.75rem; font-weight: 600;
        }
        .pa-hero-gradient {
          background: linear-gradient(to bottom right, ${scheme.accentBg}, transparent, transparent);
        }
        .pa-cta-card {
          background: linear-gradient(to right, ${scheme.accentCtaBg}, #1a1a1a);
        }
        .pa-icon { color: ${scheme.accent}; }
      `}</style>

      {/* Scheme switcher bar */}
      <div style={{ background: '#111', borderBottom: '1px solid #2a2a2a' }}>
        <div className="container-page">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Preview
            </span>
            {SCHEMES.map((s) =>
              s.slug === currentSlug ? (
                <span key={s.slug} className="pa-switcher-active">{s.name}</span>
              ) : (
                <Link
                  key={s.slug}
                  href={`/preview/${s.slug}`}
                  style={{
                    borderRadius: '9999px',
                    padding: '0.25rem 0.875rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#9ca3af',
                    border: '1px solid #2a2a2a',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                >
                  {s.name}
                </Link>
              )
            )}
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#6b7280' }}>
              Preview only — not live
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #2a2a2a', background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(8px)' }}>
        <div className="container-page">
          <div style={{ display: 'flex', height: '4rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#fff' }}>
              <Radar className="pa-icon" style={{ width: '1.25rem', height: '1.25rem' }} />
              <span style={{ fontSize: '1.125rem' }}>RaceRadar HQ</span>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {['Events', 'Venues', 'Series'].map((label) => (
                <span
                  key={label}
                  style={{
                    borderRadius: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#9ca3af',
                  }}
                >
                  {label}
                </span>
              ))}
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 600 }}>Log in</span>
              <span className="pa-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'default' }}>Sign up</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #2a2a2a' }}>
        <div className="pa-hero-gradient" style={{ position: 'absolute', inset: 0 }} />
        <div className="container-page" style={{ position: 'relative', paddingTop: '6rem', paddingBottom: '6rem' }}>
          <div style={{ maxWidth: '48rem' }}>
            <h1 className="page-title">
              Australia's home for{' '}
              <span className="pa-text">endurance sport.</span>
            </h1>
            <p style={{ marginTop: '1.5rem', fontSize: '1.125rem', color: '#9ca3af', lineHeight: '1.75' }}>
              Find HYROX, Spartan, Tough Mudder, obstacle races, trail runs, and fun runs near you.
              Built for athletes, fitness clubs, and anyone who loves to push their limits.
            </p>
            <div style={{ marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <a href="#" className="pa-btn">
                Find Events <ArrowRight style={{ width: '1rem', height: '1rem' }} />
              </a>
              <a
                href="#"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #2a2a2a',
                  background: '#1a1a1a',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                Browse Venues
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderBottom: '1px solid #2a2a2a' }}>
        <div className="container-page" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'center' }}>
            {[
              { Icon: Calendar, label: 'Events Listed', value: '200+' },
              { Icon: MapPin, label: 'Event Venues', value: '80+' },
              { Icon: Trophy, label: 'Active Series', value: '40+' },
            ].map(({ Icon, label, value }) => (
              <div key={label}>
                <Icon className="pa-icon" style={{ margin: '0 auto 0.5rem', width: '1.5rem', height: '1.5rem' }} />
                <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#fff' }}>{value}</div>
                <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured events placeholder */}
      <section className="container-page" style={{ paddingTop: '4rem', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 className="section-title">Featured Events</h2>
          <span className="pa-text-l" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View all <ArrowRight style={{ width: '1rem', height: '1rem' }} />
          </span>
        </div>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { discipline: 'HYROX', title: 'HYROX Sydney 2025', location: 'Sydney, NSW', date: 'Aug 2025' },
            { discipline: 'Spartan Race', title: 'Spartan Sprint Melbourne', location: 'Melbourne, VIC', date: 'Sep 2025' },
            { discipline: 'Trail Run', title: 'Blue Mountains Trail Ultra', location: 'Katoomba, NSW', date: 'Oct 2025' },
          ].map((event) => (
            <div
              key={event.title}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '9999px',
                    padding: '0.125rem 0.625rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: scheme.accentBg,
                    color: scheme.accentLight,
                  }}
                >
                  {event.discipline}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', border: '1px solid #2a2a2a', borderRadius: '9999px', padding: '0.125rem 0.625rem' }}>Race</span>
              </div>
              <h3 style={{ fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{event.title}</h3>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Calendar className="pa-icon" style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0 }} />
                  {event.date}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <MapPin className="pa-icon" style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0 }} />
                  {event.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page" style={{ paddingBottom: '5rem', paddingTop: '3rem' }}>
        <div className="pa-cta-card" style={{ borderRadius: '0.75rem', border: '1px solid #2a2a2a', textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 className="section-title">Never miss an event</h2>
          <p style={{ marginTop: '0.75rem', color: '#9ca3af', maxWidth: '28rem', margin: '0.75rem auto 0' }}>
            Create a free account to save events, follow series, and get alerts tailored to your discipline and location.
          </p>
          <a href="#" className="pa-btn" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            Get started — it's free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #2a2a2a', background: '#0f0f0f', marginTop: '0' }}>
        <div className="container-page" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
            <Radar className="pa-icon" style={{ width: '1.25rem', height: '1.25rem' }} />
            <span>RaceRadar HQ</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Your guide to fitness races, obstacle runs, and endurance events across Australia.
          </p>
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid #2a2a2a', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
            © 2025 RaceRadar HQ. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}

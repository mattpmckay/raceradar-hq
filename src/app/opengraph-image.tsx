import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'RaceRadar HQ — Fitness Events Across Asia Pacific'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1525 60%, #0f1e2e 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Radar rings — decorative */}
        <div style={{
          position: 'absolute',
          width: '520px', height: '520px',
          borderRadius: '50%',
          border: '1px solid rgba(0,217,166,0.08)',
          top: '55px', left: '340px',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          width: '360px', height: '360px',
          borderRadius: '50%',
          border: '1px solid rgba(0,217,166,0.12)',
          top: '135px', left: '420px',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          width: '200px', height: '200px',
          borderRadius: '50%',
          border: '1px solid rgba(0,217,166,0.18)',
          top: '215px', left: '500px',
          display: 'flex',
        }} />

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          {/* Radar dot */}
          <div style={{
            width: '14px', height: '14px',
            borderRadius: '50%',
            background: '#00D9A6',
            boxShadow: '0 0 20px rgba(0,217,166,0.6)',
            display: 'flex',
          }} />
          <span style={{
            fontSize: '52px',
            fontWeight: '700',
            letterSpacing: '-1px',
            color: '#f0f4f8',
          }}>
            RaceRadar{' '}
            <span style={{ color: '#00D9A6' }}>HQ</span>
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: '26px',
          color: 'rgba(180,200,220,0.75)',
          letterSpacing: '0.5px',
          textAlign: 'center',
          display: 'flex',
        }}>
          Fitness Events Across Asia Pacific
        </div>

        {/* Discipline pills */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '48px',
        }}>
          {['HYROX', 'Ironman', 'Spartan', 'Marathon', 'Trail'].map((label) => (
            <div
              key={label}
              style={{
                padding: '8px 18px',
                borderRadius: '999px',
                border: '1px solid rgba(0,217,166,0.25)',
                background: 'rgba(0,217,166,0.08)',
                fontSize: '18px',
                color: 'rgba(0,217,166,0.9)',
                fontWeight: '500',
                display: 'flex',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}

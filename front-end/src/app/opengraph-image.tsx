import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'classic.et — Developer-Grade URL Shortener & Click Telemetry';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0c0d0e',
          padding: '60px 70px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle 1px Border frame inside */}
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '1px solid #27282b',
            borderRadius: '24px',
            pointerEvents: 'none',
          }}
        />

        {/* Header Row: Brand badge & System status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Brand Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                backgroundColor: '#141517',
                borderRadius: '12px',
                border: '1px solid #27282b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="#ff6363"
                stroke="#ff6363"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#ededed',
                letterSpacing: '-0.03em',
                fontFamily: 'monospace',
              }}
            >
              classic.et
            </span>
          </div>

          {/* Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#141517',
              border: '1px solid #27282b',
              padding: '8px 18px',
              borderRadius: '9999px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: '#5fc992',
              }}
            />
            <span
              style={{
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#8c8d91',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Cloudflare Edge Routing
            </span>
          </div>
        </div>

        {/* Center Content: Headline & Value Proposition */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            maxWidth: '1000px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#ff6363',
                backgroundColor: 'rgba(255, 99, 99, 0.1)',
                border: '1px solid rgba(255, 99, 99, 0.3)',
                padding: '4px 12px',
                borderRadius: '6px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              High-Velocity Shortlinks
            </span>
          </div>

          <h1
            style={{
              fontSize: '54px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              margin: 0,
            }}
          >
            Developer-Grade URL Shortener & Click Telemetry
          </h1>

          <p
            style={{
              fontSize: '22px',
              color: '#8c8d91',
              lineHeight: 1.45,
              margin: 0,
              fontWeight: 400,
            }}
          >
            High-performance short links with sub-millisecond edge redirects, real-time analytics retention, custom branded slugs, and developer API quotas.
          </p>
        </div>

        {/* Footer Metrics & Capabilities Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#141517',
              border: '1px solid #27282b',
              padding: '12px 20px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#ededed',
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: '#ff6363' }}>⚡</span>
            <span>&lt;15ms Redirects</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#141517',
              border: '1px solid #27282b',
              padding: '12px 20px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#ededed',
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: '#5fc992' }}>📊</span>
            <span>Raw Clickstream Telemetry</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#141517',
              border: '1px solid #27282b',
              padding: '12px 20px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#ededed',
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: '#56c2ff' }}>🔗</span>
            <span>Custom Slugs & QR Codes</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#141517',
              border: '1px solid #27282b',
              padding: '12px 20px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#ededed',
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: '#f59e0b' }}>🛡️</span>
            <span>Chapa Verified</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

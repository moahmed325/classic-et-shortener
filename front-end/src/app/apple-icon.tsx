import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0d0e',
        }}
      >
        <div
          style={{
            width: '140px',
            height: '140px',
            backgroundColor: '#141517',
            borderRadius: '32px',
            border: '2px solid #27282b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Coral Lightning Bolt */}
          <svg
            width="76"
            height="76"
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
      </div>
    ),
    {
      ...size,
    }
  );
}

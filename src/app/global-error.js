"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#0b73b1' }}>
            Something went wrong!
          </h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            {error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2991ce',
              color: '#fff',
              border: '2px solid #0b73b1',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              textTransform: 'uppercase',
              transition: '0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#0b73b1';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#2991ce';
              e.target.style.color = '#fff';
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}


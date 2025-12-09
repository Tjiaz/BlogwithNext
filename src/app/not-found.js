import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#0b73b1', fontSize: '2rem' }}>
        404 - Page Not Found
      </h2>
      <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.2rem' }}>
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        style={{
          padding: '10px 20px',
          backgroundColor: '#2991ce',
          color: '#fff',
          border: '2px solid #0b73b1',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize: '16px',
          textTransform: 'uppercase',
          transition: '0.3s',
          display: 'inline-block'
        }}
      >
        Return Home
      </Link>
    </div>
  );
}


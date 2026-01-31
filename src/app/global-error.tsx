'use client';

/**
 * Global error boundary for Next.js App Router.
 * Catches unhandled errors that would otherwise crash the entire app.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          backgroundColor: '#f9fafb',
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '480px' }}>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '0.5rem',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            An unexpected error occurred. Please try again.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.625rem 1.5rem',
                backgroundColor: '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                padding: '0.625rem 1.5rem',
                backgroundColor: '#fff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Go Home
            </a>
          </div>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <pre
              style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                color: '#991b1b',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: '200px',
              }}
            >
              {error.message}
            </pre>
          )}
        </div>
      </body>
    </html>
  );
}

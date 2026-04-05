export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0f0e0c',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <p style={{ fontSize: '48px', marginBottom: '20px' }}>📵</p>
      <p
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '24px',
          color: '#f5f2ea',
          marginBottom: '10px',
        }}
      >
        You&apos;re offline
      </p>
      <p
        style={{
          fontSize: '14px',
          color: 'rgba(245,242,234,0.45)',
          lineHeight: 1.6,
          maxWidth: '280px',
        }}
      >
        Check your connection and try again. Your goals and streak are safe.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '28px',
          background: '#c8922a',
          color: '#0f0e0c',
          border: 'none',
          borderRadius: '10px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}

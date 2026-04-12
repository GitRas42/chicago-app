export default function Header({ title, onBack, right }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'calc(14px + env(safe-area-inset-top, 0px)) 16px 10px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: 'var(--burgundy)', fontSize: 16, fontWeight: 700 }}
          >
            ←
          </button>
        )}
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, letterSpacing: -0.5 }}>
          {title}
        </h1>
      </div>
      {right && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{right}</div>}
    </div>
  );
}

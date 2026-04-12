import Button from '../ui/Button';

export default function WinnerScreen({ winner, finalScores, onBack, t }) {
  const entries = Object.entries(finalScores).sort(
    ([, a], [, b]) => (typeof b === 'number' ? b : 0) - (typeof a === 'number' ? a : 0)
  );

  return (
    <div
      className="fi"
      style={{
        padding: 24,
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, color: 'var(--gold)', marginBottom: 8, fontWeight: 900 }}>
        {t("gameWon")}
      </h1>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, color: 'var(--burgundy)', marginBottom: 28 }}>
        {winner}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
        {entries.map(([p, s]) => (
          <div
            key={p}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: p === winner ? 'rgba(200,169,110,0.19)' : 'var(--card)',
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontWeight: p === winner ? 700 : 400 }}>
              {p === winner ? "🏆 " : ""}{p}
            </span>
            <span style={{ fontWeight: 700 }}>
              {s}{typeof s === 'number' ? t("pt") : ''}
            </span>
          </div>
        ))}
      </div>
      <Button onClick={onBack} s={{ width: '100%' }}>{t("back")}</Button>
    </div>
  );
}

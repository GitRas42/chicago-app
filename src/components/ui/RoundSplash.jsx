import { useEffect } from 'react';

export default function RoundSplash({ num, t, onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 1400);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44,24,16,.72)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="rr" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>♠</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, color: 'var(--gold)', fontWeight: 900 }}>
          {t("round")} {num}
        </h2>
      </div>
    </div>
  );
}

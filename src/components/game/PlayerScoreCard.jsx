import Card from '../ui/Card';

export default function PlayerScoreCard({ player, score, isSelected, isKopstopp, flashActive, onSelect, onEditClick, onKopstoppClick, t }) {
  return (
    <Card
      flash={flashActive}
      onClick={onSelect}
      style={{
        padding: '12px 16px',
        border: isSelected ? '2px solid var(--burgundy)' : '1px solid var(--border)',
        background: isSelected ? 'rgba(139,26,43,0.03)' : 'var(--card)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>{player}</span>
          {isKopstopp && (
            <span
              onClick={(e) => { e.stopPropagation(); onKopstoppClick(); }}
              style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                background: 'rgba(155,44,44,0.09)', color: 'var(--red)', cursor: 'pointer',
              }}
            >
              🔒 {t("kopstoppWarning")}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: 'var(--burgundy)' }}>
            {score}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onEditClick(); }}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 15 }}
          >
            ✎
          </button>
        </div>
      </div>
    </Card>
  );
}

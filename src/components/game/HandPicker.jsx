import Button from '../ui/Button';
import { HANDS } from '../../games/chicago/config';

export default function HandPicker({ player, onScore, onRoyalWin, onSkip, t }) {
  return (
    <div className="pi" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', marginBottom: 2 }}>
        {t("selectHand")} — {player}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {HANDS.map((h) => (
          <Button
            key={h.id}
            onClick={() => onScore(player, h.points, h.id)}
            v="secondary"
            small
            s={{ display: 'flex', justifyContent: 'space-between', gap: 4, width: '100%' }}
          >
            <span>{t(h.id)}</span>
            <span style={{ color: 'var(--gold)', fontWeight: 800 }}>{h.points}{t("pt")}</span>
          </Button>
        ))}
      </div>
      <Button onClick={() => onRoyalWin(player)} v="royal" s={{ width: '100%', marginTop: 4 }}>
        👑 {t("royalFlush")} — {t("instantWin")}
      </Button>
    </div>
  );
}

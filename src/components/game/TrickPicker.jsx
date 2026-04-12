import Button from '../ui/Button';

export default function TrickPicker({ player, onScore, t }) {
  return (
    <div className="pi" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center' }}>
        {t("lastTrick")} — {player}
      </p>
      <Button onClick={() => onScore(player, 5, "lastTrickLabel", "tr")} v="secondary" s={{ width: '100%' }}>
        {t("lastTrick")} — <span style={{ color: 'var(--gold)', fontWeight: 800 }}>5{t("pt")}</span>
      </Button>
      <Button onClick={() => onScore(player, 10, "lastTrickTwoLabel", "tr")} v="gold" s={{ width: '100%' }}>
        {t("lastTrickTwo")} — <span style={{ fontWeight: 800 }}>10{t("pt")}</span>
      </Button>
    </div>
  );
}

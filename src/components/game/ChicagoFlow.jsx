import Modal from '../ui/Modal';
import Button from '../ui/Button';

export function ChicagoPick({ players, scores, onDeclare, onCancel, t }) {
  return (
    <Modal onClose={onCancel}>
      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, textAlign: 'center', marginBottom: 10 }}>
        🃏 {t("chicagoWho")}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {players.map((p) => {
          const ok = scores[p] >= 15;
          return (
            <Button key={p} onClick={() => ok && onDeclare(p)} v={ok ? "secondary" : "ghost"} disabled={!ok} s={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span>{p} ({scores[p]}{t("pt")})</span>
                {!ok && <span style={{ fontSize: 12, color: 'var(--muted)' }}>— {t("chicagoNotEnough")}</span>}
              </div>
            </Button>
          );
        })}
        <Button onClick={onCancel} v="ghost" small s={{ marginTop: 4 }}>{t("cancel")}</Button>
      </div>
    </Modal>
  );
}

export function ChicagoResolve({ chicagoPlayer, onResolve, t }) {
  return (
    <Modal onClose={() => {}}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'center' }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22 }}>🃏 Chicago</h3>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--burgundy)' }}>{chicagoPlayer}</p>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>{t("chicagoResolve")}</p>
        <Button onClick={() => onResolve(true)} v="success" s={{ width: '100%' }}>
          ✓ {t("chicagoSuccess")} (+15{t("pt")})
        </Button>
        <Button onClick={() => onResolve(false)} v="danger" s={{ width: '100%' }}>
          ✗ {t("chicagoFail")} (−15{t("pt")})
        </Button>
      </div>
    </Modal>
  );
}

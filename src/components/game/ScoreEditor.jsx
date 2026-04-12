import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function ScoreEditor({ player, score, onSave, onClose, t }) {
  const [v, setV] = useState(score);

  return (
    <Modal onClose={onClose}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 14 }}>{t("editScore")} — {player}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
          <button
            onClick={() => setV(Math.max(0, v - 1))}
            style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '2px solid var(--burgundy)', background: 'none',
              fontSize: 24, fontWeight: 700, color: 'var(--burgundy)',
            }}
          >
            −
          </button>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 900, minWidth: 60 }}>
            {v}
          </span>
          <button
            onClick={() => setV(v + 1)}
            style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '2px solid var(--burgundy)', background: 'none',
              fontSize: 24, fontWeight: 700, color: 'var(--burgundy)',
            }}
          >
            +
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={onClose} v="ghost" s={{ flex: 1 }}>{t("cancel")}</Button>
          <Button onClick={() => onSave(v)} s={{ flex: 1 }}>{t("save")}</Button>
        </div>
      </div>
    </Modal>
  );
}

import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAppState } from '../App';
import Header from '../components/ui/Header';
import Card from '../components/ui/Card';

export default function GameDetail() {
  const { t } = useTranslation();
  const { games } = useAppState();
  const navigate = useNavigate();
  const { id } = useParams();

  const gm = games.find((g) => String(g.id) === id);
  if (!gm) { navigate('/history'); return null; }

  const sorted = [...gm.players].sort((a, b) => {
    const sa = typeof gm.finalScores[a] === 'number' ? gm.finalScores[a] : 0;
    const sb = typeof gm.finalScores[b] === 'number' ? gm.finalScores[b] : 0;
    return sb - sa;
  });

  return (
    <div className="fi">
      <Header title={`${t("chicago")} — ${new Date(gm.finishedAt).toLocaleDateString()}`} onBack={() => navigate('/history')} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, marginBottom: 10 }}>{t("finalScores")}</h3>
          {sorted.map((p, i) => (
            <div key={p} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: i < sorted.length - 1 ? '1px solid var(--border-light)' : 'none',
            }}>
              <span style={{ fontWeight: p === gm.winner ? 700 : 400 }}>{p === gm.winner ? "🏆 " : ""}{p}</span>
              <span style={{ fontWeight: 700, fontFamily: "'Playfair Display',serif", color: 'var(--burgundy)' }}>
                {gm.finalScores[p]}{typeof gm.finalScores[p] === 'number' ? t("pt") : ''}
              </span>
            </div>
          ))}
        </Card>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18 }}>{t("roundByRound")}</h3>
        {gm.allRounds?.map((r) => (
          <Card key={r.roundNumber} style={{ padding: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: 'var(--muted)' }}>
              {t("round")} {r.roundNumber}
            </p>
            {r.events.filter((e) => e.points !== 0).map((ev, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '2px 0' }}>
                <span>{ev.player}</span>
                <span style={{ color: ev.points > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                  {ev.points > 0 ? "+" : ""}{ev.points}{t("pt")} ({t(ev.hand)})
                </span>
              </div>
            ))}
            {r.events.filter((e) => e.points !== 0).length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>{t("noPoints")}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

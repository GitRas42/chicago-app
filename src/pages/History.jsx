import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAppState } from '../App';
import { useAuth } from '../features/auth/AuthContext';
import { isOnline } from '../services/supabase';
import { fetchGameHistory } from '../services/gameHistory';
import Header from '../components/ui/Header';
import Card from '../components/ui/Card';

export default function History() {
  const { t } = useTranslation();
  const { games } = useAppState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [remoteGames, setRemoteGames] = useState(null);

  useEffect(() => {
    if (isOnline()) {
      fetchGameHistory('chicago', 100).then(setRemoteGames);
    }
  }, []);

  // Merge local and remote games, preferring remote when available
  const buildList = () => {
    if (remoteGames && remoteGames.length > 0) {
      // Convert remote format to display format
      return remoteGames.map((g) => ({
        id: g.id,
        finishedAt: g.completed_at,
        winner: g.winner_name || (g.is_tie ? t("tie") : '—'),
        isTie: g.is_tie,
        players: (g.player_data || []).map((p) => p.displayName),
        finalScores: Object.fromEntries((g.player_data || []).map((p) => [p.displayName, p.finalScore])),
        allRounds: [],
        source: 'remote',
        gameType: g.game_type,
      }));
    }
    // Fallback to local
    return games.map((g) => ({ ...g, source: 'local' }));
  };

  const list = buildList();
  const sorted = [...list].sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));

  return (
    <div className="fi">
      <Header title={t("history")} onBack={() => navigate('/')} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!sorted.length && (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>{t("noHistory")}</p>
        )}
        {sorted.map((g) => (
          <Card
            key={g.id}
            onClick={() => g.source === 'local' ? navigate(`/history/${g.id}`) : null}
            style={{ cursor: g.source === 'local' ? 'pointer' : 'default' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                {new Date(g.finishedAt).toLocaleDateString()}
              </span>
              {g.isTie && (
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>
                  {t("tie")}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 17 }}>
                {g.isTie ? `⚖ ${t("tie")}` : `🏆 ${g.winner}`}
              </span>
              {!g.isTie && g.finalScores?.[g.winner] != null && (
                <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: 'var(--burgundy)', fontSize: 20 }}>
                  {typeof g.finalScores[g.winner] === 'number' ? g.finalScores[g.winner] : '—'}{t("pt")}
                </span>
              )}
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: 'var(--muted)' }}>{g.players.join(', ')}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

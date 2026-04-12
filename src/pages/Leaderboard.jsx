import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAppState } from '../App';
import { isOnline } from '../services/supabase';
import { getLeaderboard, getPlayerMatchups } from '../services/leaderboard';
import Header from '../components/ui/Header';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

const STAT_OPTIONS = [
  { key: 'total_wins', labelKey: 'wins' },
  { key: 'total_games', labelKey: 'gamesPlayed' },
  { key: 'win_percentage', labelKey: 'winRate' },
  { key: 'avg_score', labelKey: 'avgScore' },
  { key: 'highest_score', labelKey: 'highScore' },
];

export default function Leaderboard() {
  const { t } = useTranslation();
  const { games } = useAppState();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState('total_wins');
  const [remoteData, setRemoteData] = useState(null);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [matchups, setMatchups] = useState([]);
  const [loadingMatchups, setLoadingMatchups] = useState(false);

  // Fetch from Supabase
  useEffect(() => {
    if (!isOnline()) return;
    setLoadingRemote(true);
    getLeaderboard('chicago', sortBy, sortBy === 'win_percentage' || sortBy === 'avg_score' ? 3 : 0)
      .then(setRemoteData)
      .finally(() => setLoadingRemote(false));
  }, [sortBy]);

  // Fetch matchups when player selected
  useEffect(() => {
    if (!selectedPlayer) return;
    setLoadingMatchups(true);
    getPlayerMatchups('chicago', selectedPlayer)
      .then(setMatchups)
      .finally(() => setLoadingMatchups(false));
  }, [selectedPlayer]);

  // Build local stats as fallback
  const localStats = {};
  games.forEach((g) => {
    g.players.forEach((p) => {
      if (!localStats[p]) localStats[p] = { player_name: p, total_wins: 0, total_games: 0, total_points: 0, highest_score: 0 };
      localStats[p].total_games++;
      const score = typeof g.finalScores?.[p] === 'number' ? g.finalScores[p] : 0;
      localStats[p].total_points += score;
      localStats[p].highest_score = Math.max(localStats[p].highest_score, score);
      if (p === g.winner) localStats[p].total_wins++;
    });
  });

  // Compute derived fields for local stats
  const localLeaderboard = Object.values(localStats).map((s) => ({
    ...s,
    win_percentage: s.total_games > 0 ? Math.round((s.total_wins / s.total_games) * 1000) / 10 : 0,
    avg_score: s.total_games > 0 ? Math.round((s.total_points / s.total_games) * 10) / 10 : 0,
  }));

  // Use remote data if available, else local
  const data = remoteData || localLeaderboard;

  // Sort
  const sorted = [...data].sort((a, b) => {
    const va = a[sortBy] ?? 0;
    const vb = b[sortBy] ?? 0;
    return vb - va;
  });

  const getStatValue = (row) => {
    switch (sortBy) {
      case 'total_wins': return `${row.total_wins} ${t("wins").toLowerCase()}`;
      case 'total_games': return `${row.total_games} ${t("gamesPlayed").toLowerCase()}`;
      case 'win_percentage': return `${row.win_percentage}%`;
      case 'avg_score': return `${row.avg_score} ${t("avgScore").toLowerCase()}`;
      case 'highest_score': return `${row.highest_score}${t("pt")}`;
      default: return '';
    }
  };

  const getSubStat = (row) => {
    if (sortBy === 'total_wins') {
      return `${row.total_games} ${t("gamesPlayed").toLowerCase()} · ${row.win_percentage || 0}%`;
    }
    return `${row.total_wins} ${t("wins").toLowerCase()} / ${row.total_games} ${t("gamesPlayed").toLowerCase()}`;
  };

  return (
    <div className="fi">
      <Header title={t("leaderboard")} onBack={() => navigate('/')} />

      {/* Stat selector */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-light)',
      }}>
        {STAT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            style={{
              padding: '6px 12px',
              borderRadius: 16,
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              border: sortBy === opt.key ? '2px solid var(--burgundy)' : '1px solid var(--border)',
              background: sortBy === opt.key ? 'var(--burgundy)' : 'transparent',
              color: sortBy === opt.key ? 'var(--white)' : 'var(--text)',
            }}
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loadingRemote && !remoteData && (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>...</p>
        )}
        {!sorted.length && !loadingRemote && (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>{t("noLeaderboard")}</p>
        )}
        {sorted.map((row, i) => (
          <Card
            key={row.player_name}
            onClick={() => isOnline() && setSelectedPlayer(row.player_name)}
            style={{ padding: '12px 16px', cursor: isOnline() ? 'pointer' : 'default' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 22,
                  color: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--sepia)' : 'var(--muted)', minWidth: 30,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontWeight: 700, fontSize: 17 }}>{row.player_name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 20, color: 'var(--burgundy)' }}>
                  {getStatValue(row)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {getSubStat(row)}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {(sortBy === 'win_percentage' || sortBy === 'avg_score') && sorted.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 4 }}>
            {t("minGamesNote")}
          </p>
        )}
      </div>

      {/* Player detail modal with head-to-head */}
      {selectedPlayer && (
        <Modal onClose={() => setSelectedPlayer(null)}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 4, fontWeight: 800 }}>
            {selectedPlayer}
          </h3>

          {/* Player stats summary */}
          {(() => {
            const row = sorted.find((r) => r.player_name === selectedPlayer);
            if (!row) return null;
            return (
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, marginTop: 8 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: 8, background: 'var(--bg-dark)', borderRadius: 8 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 20, color: 'var(--burgundy)' }}>
                    {row.total_wins}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t("wins")}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: 8, background: 'var(--bg-dark)', borderRadius: 8 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 20, color: 'var(--burgundy)' }}>
                    {row.win_percentage || 0}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t("winRate")}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: 8, background: 'var(--bg-dark)', borderRadius: 8 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 20, color: 'var(--burgundy)' }}>
                    {row.highest_score || 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t("highScore")}</div>
                </div>
              </div>
            );
          })()}

          <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, marginBottom: 8, fontWeight: 700 }}>
            {t("headToHead")}
          </h4>

          {loadingMatchups && <p style={{ color: 'var(--muted)', fontSize: 14 }}>...</p>}
          {!loadingMatchups && matchups.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>{t("noMatchups")}</p>
          )}
          {matchups.map((m) => (
            <div key={m.opponent} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderTop: '1px solid var(--border-light)',
            }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>vs {m.opponent}</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontWeight: 700, fontSize: 15,
                  color: m.myWins > m.theirWins ? 'var(--green)' : m.myWins < m.theirWins ? 'var(--red)' : 'var(--muted)',
                }}>
                  {m.myWins}-{m.theirWins}
                </span>
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 6 }}>
                  ({m.totalGames} {t("gamesPlayed").toLowerCase()})
                </span>
              </div>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}

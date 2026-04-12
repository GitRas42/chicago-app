import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAppState } from '../App';
import { useAuth } from '../features/auth/AuthContext';
import { useGameState } from '../hooks/useGameState';
import { useToast } from '../components/ui/Toast';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import RoundSplash from '../components/ui/RoundSplash';
import StepProgress from '../components/game/StepProgress';
import PlayerScoreCard from '../components/game/PlayerScoreCard';
import HandPicker from '../components/game/HandPicker';
import TrickPicker from '../components/game/TrickPicker';
import { ChicagoPick, ChicagoResolve } from '../components/game/ChicagoFlow';
import ScoreEditor from '../components/game/ScoreEditor';
import WinnerScreen from '../components/game/WinnerScreen';
import Rules from './Rules';

export default function ActiveGame() {
  const { t } = useTranslation();
  const { active, setActive, games, setGames } = useAppState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fire = useToast();

  const {
    g, steps, cur, done, sorted, chiActive,
    undo, scorePlayer, skipStep,
    declareChicago, resolveChicago, royalWin, finishRound,
    editScore, kopReset,
  } = useGameState({ active, setActive, games, setGames: setGames, t, userId: user?.id });

  const [selP, setSelP] = useState(null);
  const [chiPick, setChiPick] = useState(false);
  const [chiResolve, setChiResolve] = useState(false);
  const [editP, setEditP] = useState(null);
  const [ksP, setKsP] = useState(null);
  const [winnerData, setWinnerData] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [splash, setSplash] = useState(false);
  const [flashP, setFlashP] = useState(null);
  const [confirmQuit, setConfirmQuit] = useState(false);

  if (!g) {
    if (winnerData) {
      return (
        <WinnerScreen
          winner={winnerData.winner}
          finalScores={winnerData.finalScores}
          onBack={() => { setWinnerData(null); navigate('/'); }}
          t={t}
        />
      );
    }
    return <Navigate to="/" replace />;
  }

  const blink = (p) => { setFlashP(p); setTimeout(() => setFlashP(null), 800); };

  const handleScore = (player, points, hand, stepKey) => {
    const key = stepKey || cur?.key;
    scorePlayer(player, points, hand, key);
    blink(player);
    setSelP(null);
    fire(`${player}: ${points > 0 ? "+" : ""}${points}${t("pt")} (${t(hand)})`);
  };

  const handleSkip = () => {
    skipStep();
    setSelP(null);
    fire(`✓ ${t("noPointsConfirm")}`);
  };

  const handleUndo = () => {
    undo();
    setSelP(null);
    fire(`↩ ${t("undo")}`);
  };

  const handleDeclareChicago = (player) => {
    declareChicago(player);
    setChiPick(false);
    setChiResolve(true);
    fire(`🃏 Chicago — ${player}`);
  };

  const handleResolveChicago = (ok) => {
    const p = g.chicagoPlayer;
    resolveChicago(ok);
    setChiResolve(false);
    blink(p);
    fire(ok ? `${p}: +15${t("pt")} 🃏` : `${p}: −15${t("pt")} 🃏`);
  };

  const handleRoyalWin = (player) => {
    const result = royalWin(player);
    setWinnerData(result);
  };

  const handleFinishRound = () => {
    const result = finishRound();
    if (result) {
      setWinnerData(result);
    } else {
      setSelP(null);
      setSplash(true);
    }
  };

  const handleEditScore = (p, v) => {
    editScore(p, v);
    setEditP(null);
  };

  const handleKopReset = (p) => {
    kopReset(p);
    setKsP(null);
    blink(p);
    fire(`${p} → 0${t("pt")}`);
  };

  const handleQuit = () => {
    setActive(null);
    navigate('/');
  };

  if (showRules) return <Rules inGame onBack={() => setShowRules(false)} />;
  if (splash) return <RoundSplash num={g.currentRound} t={t} onDone={() => setSplash(false)} />;

  const canUndo = (g.snapshots || []).length > 0;

  return (
    <div className="fi" style={{ paddingBottom: 120 }}>
      <Header
        title={`${t("chicago")} — ${t("round")} ${g.currentRound}`}
        right={<>
          {canUndo && (
            <button onClick={handleUndo} style={{
              background: 'var(--bg-dark)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '4px 10px', fontSize: 13, color: 'var(--burgundy)', fontWeight: 600,
            }}>
              ↩ {t("undo")}
            </button>
          )}
          <button onClick={() => setShowRules(true)} style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--muted)' }}>📖</button>
          <button onClick={() => setConfirmQuit(true)} style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--red)', fontWeight: 700 }}>✕</button>
        </>}
      />

      {/* Chicago active banner */}
      {chiActive && (
        <div style={{
          background: 'rgba(200,169,110,0.15)', padding: '8px 16px', textAlign: 'center',
          borderBottom: '1px solid var(--gold)', fontWeight: 700, fontSize: 15,
        }}>
          🃏 {t("chicagoActive")} — {g.chicagoPlayer}
        </div>
      )}

      <StepProgress steps={steps} currentStep={g.currentStep} done={done} />

      {/* Current step indicator */}
      {cur && !done && !chiActive && (
        <div style={{ padding: '8px 16px 10px', textAlign: 'center' }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: 'var(--burgundy)', fontWeight: 800 }}>
            {cur.label}
          </span>
        </div>
      )}
      {done && !chiActive && (
        <div style={{ padding: '8px 16px 10px', textAlign: 'center' }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: 'var(--green)', fontWeight: 800 }}>
            ✓ {t("round")} {g.currentRound}
          </span>
        </div>
      )}

      {/* Player scores */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((p) => (
          <PlayerScoreCard
            key={p}
            player={p}
            score={g.scores[p]}
            isSelected={selP === p}
            isKopstopp={g.scores[p] >= 46}
            flashActive={flashP === p}
            onSelect={() => { if (!done && cur && !chiActive) setSelP(selP === p ? null : p); }}
            onEditClick={() => setEditP(p)}
            onKopstoppClick={() => setKsP(p)}
            t={t}
          />
        ))}
      </div>

      {/* Action panel */}
      <div style={{ padding: 16 }}>
        {/* Hand step */}
        {!done && cur?.type === "hand" && !chiActive && selP && (
          <HandPicker
            player={selP}
            onScore={(player, points, hand) => handleScore(player, points, hand, cur.key)}
            onRoyalWin={handleRoyalWin}
            onSkip={handleSkip}
            t={t}
          />
        )}
        {!done && cur?.type === "hand" && !chiActive && !selP && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 12 }}>{t("selectPlayer")}</p>
            <Button onClick={handleSkip} v="ghost" s={{ width: '100%' }}>{t("noPoints")}</Button>
          </div>
        )}

        {/* Trick step */}
        {!done && cur?.type === "trick" && !chiActive && selP && (
          <TrickPicker player={selP} onScore={handleScore} t={t} />
        )}
        {!done && cur?.type === "trick" && !chiActive && !selP && (
          <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center' }}>{t("selectPlayer")}</p>
        )}

        {/* Round end */}
        {done && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {g.players.some((p) => g.scores[p] >= 50) && (() => {
              const o = g.players.filter((p) => g.scores[p] >= 50);
              const mx = Math.max(...o.map((p) => g.scores[p]));
              if (o.filter((p) => g.scores[p] === mx).length > 1) {
                return (
                  <Card style={{ background: 'rgba(200,169,110,0.13)', textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, color: 'var(--burgundy)' }}>{t("tieBreak")}</p>
                  </Card>
                );
              }
              return null;
            })()}

            {g.roundEvents.length > 0 && (
              <Card style={{ padding: 12 }}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: 'var(--muted)' }}>
                  {t("round")} {g.currentRound}
                </p>
                {g.roundEvents.filter((e) => e.points !== 0).map((ev, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '3px 0' }}>
                    <span>{ev.player}</span>
                    <span style={{ color: ev.points > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                      {ev.points > 0 ? "+" : ""}{ev.points}{t("pt")} ({t(ev.hand)})
                    </span>
                  </div>
                ))}
                {g.roundEvents.filter((e) => e.points !== 0).length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>{t("noPoints")}</p>
                )}
              </Card>
            )}

            <Button onClick={handleFinishRound} s={{ width: '100%' }}>
              {g.players.some((p) => g.scores[p] >= 50) ? (() => {
                const o = g.players.filter((p) => g.scores[p] >= 50);
                const mx = Math.max(...o.map((p) => g.scores[p]));
                return o.filter((p) => g.scores[p] === mx).length === 1 ? `🏆 ${t("endGame")}` : `${t("nextDeal")} →`;
              })() : `${t("nextDeal")} →`}
            </Button>
          </div>
        )}
      </div>

      {/* Floating Chicago button */}
      {!chiActive && !chiPick && !chiResolve && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 80 }}>
          <button
            onClick={() => setChiPick(true)}
            style={{
              background: 'var(--text)', color: 'var(--gold)', border: '2px solid var(--gold)',
              borderRadius: 28, padding: '12px 28px', fontSize: 16, fontWeight: 700,
              fontFamily: "'Playfair Display',serif", boxShadow: '0 4px 20px rgba(44,24,16,.45)', letterSpacing: 1,
            }}
          >
            🃏 Chicago
          </button>
        </div>
      )}

      {/* Chicago pick modal */}
      {chiPick && (
        <ChicagoPick
          players={g.players}
          scores={g.scores}
          onDeclare={handleDeclareChicago}
          onCancel={() => setChiPick(false)}
          t={t}
        />
      )}

      {/* Chicago resolve modal */}
      {chiResolve && (
        <ChicagoResolve
          chicagoPlayer={g.chicagoPlayer}
          onResolve={handleResolveChicago}
          t={t}
        />
      )}

      {/* Edit score modal */}
      {editP && (
        <ScoreEditor
          player={editP}
          score={g.scores[editP]}
          onSave={(v) => handleEditScore(editP, v)}
          onClose={() => setEditP(null)}
          t={t}
        />
      )}

      {/* Köpstopp modal */}
      {ksP && (
        <Modal onClose={() => setKsP(null)}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>🔒 {t("kopstoppViolation")}</p>
            <p style={{ fontSize: 15, marginBottom: 16, color: 'var(--muted)' }}>{t("kopstoppConfirm")}</p>
            <p style={{ fontSize: 15, marginBottom: 16 }}>{ksP}: {g.scores[ksP]}{t("pt")} → 0{t("pt")}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => setKsP(null)} v="ghost" s={{ flex: 1 }}>{t("cancel")}</Button>
              <Button onClick={() => handleKopReset(ksP)} v="danger" s={{ flex: 1 }}>{t("kopstoppReset")}</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm quit modal */}
      {confirmQuit && (
        <Modal onClose={() => setConfirmQuit(false)}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>{t("confirmQuit")}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => setConfirmQuit(false)} v="ghost" s={{ flex: 1 }}>{t("cancel")}</Button>
              <Button onClick={handleQuit} v="danger" s={{ flex: 1 }}>{t("confirmQuitYes")}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

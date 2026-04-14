import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_PLAYERS = ['Spelare 1', 'Spelare 2', 'Spelare 3', 'Spelare 4']

// Buying rounds: rounds in which köpstopp can trigger
function maxBuyRounds(playerCount) {
  return playerCount <= 3 ? 3 : 2
}

// ── Styles ────────────────────────────────────────────────────────────────────

const ghostBtn = {
  background: 'none',
  border: '1px solid rgba(201,151,44,0.45)',
  color: 'var(--color-gold-light)',
  borderRadius: 6,
  padding: '4px 10px',
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const primaryBtn = (enabled) => ({
  width: '100%',
  padding: 14,
  fontSize: 16,
  fontWeight: 700,
  fontFamily: 'var(--font-display)',
  borderRadius: 10,
  border: 'none',
  background: enabled ? 'var(--color-burgundy)' : 'var(--color-border)',
  color: enabled ? 'var(--color-cream)' : 'var(--color-text-muted)',
  cursor: enabled ? 'pointer' : 'default',
  transition: 'background 0.15s',
})

// ── Main component ────────────────────────────────────────────────────────────

export default function GameSession() {
  const location = useLocation()
  const navigate = useNavigate()

  const initNames =
    Array.isArray(location.state?.players) && location.state.players.length >= 2
      ? location.state.players.slice(0, 6)
      : DEFAULT_PLAYERS

  const buyRounds = maxBuyRounds(initNames.length)

  // ── State ──────────────────────────────────────────────────────────────────

  const [players, setPlayers] = useState(() =>
    initNames.map((name, i) => ({ id: i, name, score: 0 }))
  )
  const [round, setRound] = useState(1)
  // phase: 'input' | 'splash' | 'end'
  const [phase, setPhase] = useState('input')
  const [inputs, setInputs] = useState({})      // playerId → string
  const [declared, setDeclared] = useState({})  // playerId → bool (Chicago this round)
  const [kopstopp, setKopstopp] = useState(false)
  const [snapshot, setSnapshot] = useState(null) // one-step undo
  const [toast, setToast] = useState(null)
  const [splash, setSplash] = useState(null)
  const [winner, setWinner] = useState(null)     // player object when game ends

  // ── Helpers ────────────────────────────────────────────────────────────────

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function toggleDeclare(id) {
    setDeclared((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // RSF: instant win, skip splash
  function handleRSF(player) {
    setWinner({ ...player, rsf: true })
    setPhase('end')
  }

  // ── Submit round ──────────────────────────────────────────────────────────

  function submitRound() {
    // Guard: all inputs must be valid numbers
    for (const p of players) {
      const v = inputs[p.id]
      if (v === undefined || v === '' || isNaN(Number(v))) return
    }

    // Save undo snapshot before mutating
    setSnapshot({
      players: players.map((p) => ({ ...p })),
      round,
      kopstopp,
      declared: { ...declared },
    })

    // Parse round scores
    const roundScores = {}
    players.forEach((p) => {
      roundScores[p.id] = Number(inputs[p.id])
    })

    // Chicago: player wins if their round score equals the max (ties count as win)
    const maxRS = Math.max(...Object.values(roundScores))
    const wonChicago = (id) => roundScores[id] === maxRS

    // Apply scores + Chicago bonus/penalty
    let newPlayers = players.map((p) => {
      let delta = roundScores[p.id]
      if (declared[p.id]) {
        delta += wonChicago(p.id) ? 15 : -15
      }
      return { ...p, score: p.score + delta }
    })

    // Build Chicago result info for splash display
    const chicagoInfo = {}
    players.forEach((p) => {
      if (declared[p.id]) {
        chicagoInfo[p.id] = wonChicago(p.id) ? 'won' : 'lost'
      }
    })

    // Köpstopp: only applies during buying rounds, only once
    let newKopstopp = kopstopp
    let kopstoppName = null
    if (!kopstopp && round <= buyRounds) {
      const trigger = newPlayers.find((p) => p.score >= 46)
      if (trigger) {
        newKopstopp = true
        kopstoppName = trigger.name
        // Reset triggering player's score to 0
        newPlayers = newPlayers.map((p) =>
          p.id === trigger.id ? { ...p, score: 0 } : p
        )
      }
    }

    // Toast for zero-point scorers (based on raw round input, before Chicago adj)
    const zeros = players
      .filter((p) => roundScores[p.id] === 0)
      .map((p) => p.name)
    if (zeros.length > 0) {
      showToast(`${zeros.join(' & ')} fick 0 poäng`)
    }

    // Win condition: unique highest total after this round
    const maxTotal = Math.max(...newPlayers.map((p) => p.score))
    const leaders = newPlayers.filter((p) => p.score === maxTotal)
    const roundWinner = leaders.length === 1 ? leaders[0] : null

    // Commit state
    setPlayers(newPlayers)
    setKopstopp(newKopstopp)
    setInputs({})
    setDeclared({})

    setSplash({
      roundNum: round,
      roundScores,
      chicagoInfo,
      kopstoppName,
      updatedPlayers: newPlayers,
      gameOver: !!roundWinner,
      winner: roundWinner,
    })

    if (roundWinner) setWinner(roundWinner)
    setPhase('splash')
  }

  // ── Splash → next ─────────────────────────────────────────────────────────

  function advanceFromSplash() {
    if (winner) {
      setPhase('end')
    } else {
      setRound((r) => r + 1)
      setPhase('input')
    }
  }

  // ── Undo ──────────────────────────────────────────────────────────────────

  function undo() {
    if (!snapshot) return
    setPlayers(snapshot.players)
    setRound(snapshot.round)
    setKopstopp(snapshot.kopstopp)
    setDeclared(snapshot.declared)
    setSnapshot(null)
    setWinner(null)
    setPhase('input')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === 'end') {
    return <EndScreen players={players} winner={winner} onBack={() => navigate('/')} />
  }

  if (phase === 'splash') {
    return <SplashScreen splash={splash} onDone={advanceFromSplash} />
  }

  // Input phase
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const allFilled = players.every(
    (p) => inputs[p.id] !== undefined && inputs[p.id] !== '' && !isNaN(Number(inputs[p.id]))
  )

  return (
    <div
      style={{
        minHeight: '100svh',
        background: 'var(--color-bg)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--color-wood)',
          boxShadow: '0 2px 8px rgba(44,26,14,0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--color-gold)',
            }}
          >
            Giv {round}
          </span>
          {kopstopp && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
                background: '#c0392b',
                color: '#fff',
                letterSpacing: '0.04em',
              }}
            >
              KÖPSTOPP
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {snapshot && (
            <button onClick={undo} style={ghostBtn}>
              ↩ Ångra
            </button>
          )}
          <button onClick={() => navigate('/')} style={ghostBtn}>
            ✕
          </button>
        </div>
      </header>

      {/* ── Player rows ──────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        {sorted.map((p, rank) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              marginBottom: 8,
              background: 'var(--color-surface)',
              border: `1px solid ${rank === 0 ? 'var(--color-gold)' : 'var(--color-border)'}`,
              borderRadius: 10,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Name */}
            <span
              style={{
                flex: 1,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 15,
                color: rank === 0 ? 'var(--color-gold)' : 'var(--color-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {p.name}
            </span>

            {/* Chicago declaration toggle */}
            <button
              onClick={() => toggleDeclare(p.id)}
              title="Säg Chicago"
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 12,
                border: `1px solid ${declared[p.id] ? 'var(--color-gold)' : 'var(--color-border)'}`,
                background: declared[p.id] ? 'var(--color-gold)' : 'transparent',
                color: declared[p.id] ? 'var(--color-wood)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              CHI
            </button>

            {/* Royal Straight Flush — instant win */}
            <button
              onClick={() => handleRSF(p)}
              title="Royal Straight Flush – avslutar spelet omedelbart"
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 12,
                border: '1px solid var(--color-burgundy)',
                background: 'transparent',
                color: 'var(--color-burgundy)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              RSF
            </button>

            {/* Current total */}
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 800,
                minWidth: 40,
                textAlign: 'right',
                color: 'var(--color-text)',
                flexShrink: 0,
              }}
            >
              {p.score}
            </span>

            {/* Round score input */}
            <input
              type="number"
              inputMode="numeric"
              value={inputs[p.id] ?? ''}
              onChange={(e) =>
                setInputs((prev) => ({ ...prev, [p.id]: e.target.value }))
              }
              placeholder="+p"
              style={{
                width: 62,
                padding: '8px 6px',
                textAlign: 'center',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 16,
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                outline: 'none',
                flexShrink: 0,
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 16px' }}>
        <button onClick={submitRound} disabled={!allFilled} style={primaryBtn(allFilled)}>
          Bekräfta giv {round}
        </button>
      </div>

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(26,15,8,0.92)',
            color: '#fff',
            padding: '10px 22px',
            borderRadius: 24,
            fontSize: 14,
            whiteSpace: 'nowrap',
            zIndex: 999,
            pointerEvents: 'none',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}

// ── Splash screen ─────────────────────────────────────────────────────────────

function SplashScreen({ splash, onDone }) {
  const { roundNum, roundScores, chicagoInfo, kopstoppName, updatedPlayers, gameOver, winner } =
    splash

  const sorted = [...updatedPlayers].sort(
    (a, b) => roundScores[b.id] - roundScores[a.id]
  )

  return (
    <div
      style={{
        minHeight: '100svh',
        background: 'var(--color-felt)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        fontFamily: 'var(--font-body)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-gold)',
          fontSize: 28,
          margin: '0 0 8px',
        }}
      >
        Giv {roundNum} klar
      </h2>

      {kopstoppName && (
        <div
          style={{
            margin: '8px 0 4px',
            padding: '7px 18px',
            borderRadius: 20,
            background: '#c0392b',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.04em',
          }}
        >
          KÖPSTOPP — {kopstoppName} nollställd
        </div>
      )}

      {/* Per-player results */}
      <div style={{ width: '100%', maxWidth: 380, margin: '16px 0' }}>
        {sorted.map((p) => {
          const chi = chicagoInfo[p.id]
          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '11px 16px',
                marginBottom: 8,
                background: 'rgba(255,249,240,0.08)',
                borderRadius: 8,
                border: '1px solid rgba(201,151,44,0.25)',
              }}
            >
              <div>
                <span
                  style={{
                    color: 'var(--color-cream)',
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  {p.name}
                </span>
                {chi && (
                  <span
                    style={{
                      fontSize: 12,
                      marginLeft: 8,
                      fontWeight: 700,
                      color: chi === 'won' ? 'var(--color-gold)' : '#e74c3c',
                    }}
                  >
                    CHI {chi === 'won' ? '+15' : '−15'}
                  </span>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    color: 'var(--color-gold)',
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  +{roundScores[p.id]}
                </span>
                <span
                  style={{
                    color: 'rgba(255,249,240,0.7)',
                    fontSize: 13,
                    marginLeft: 8,
                  }}
                >
                  → {p.score}p
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Game-over banner or tie note */}
      {gameOver ? (
        <p
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-gold)',
            fontSize: 22,
            margin: '0 0 20px',
            textAlign: 'center',
          }}
        >
          {winner.name} vinner!
        </p>
      ) : (
        <p
          style={{
            color: 'rgba(255,249,240,0.55)',
            fontSize: 13,
            margin: '0 0 20px',
            textAlign: 'center',
          }}
        >
          Lika i toppen — spela vidare
        </p>
      )}

      <button
        onClick={onDone}
        style={{
          padding: '13px 40px',
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          borderRadius: 10,
          border: 'none',
          background: 'var(--color-gold)',
          color: 'var(--color-wood)',
          cursor: 'pointer',
        }}
      >
        {gameOver ? 'Se slutresultat' : 'Nästa giv →'}
      </button>
    </div>
  )
}

// ── End screen ────────────────────────────────────────────────────────────────

function EndScreen({ players, winner, onBack }) {
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div
      style={{
        minHeight: '100svh',
        background: 'var(--color-wood)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        fontFamily: 'var(--font-body)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-gold)',
          fontSize: 32,
          textAlign: 'center',
          margin: '0 0 8px',
        }}
      >
        Spelet är slut!
      </h1>

      {winner ? (
        <p
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-cream)',
            fontSize: 20,
            margin: '0 0 24px',
            textAlign: 'center',
          }}
        >
          {winner.rsf ? '🃏 Royal Straight Flush — ' : '🏆 '}
          {winner.name} vinner!
        </p>
      ) : (
        <p
          style={{
            color: 'var(--color-gold-light)',
            fontSize: 18,
            margin: '0 0 24px',
            textAlign: 'center',
          }}
        >
          Oavgjort
        </p>
      )}

      {/* Final scoreboard */}
      <div style={{ width: '100%', maxWidth: 380, marginBottom: 32 }}>
        {sorted.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 18px',
              marginBottom: 8,
              background:
                i === 0
                  ? 'rgba(201,151,44,0.18)'
                  : 'rgba(255,249,240,0.06)',
              border: `1px solid ${
                i === 0 ? 'var(--color-gold)' : 'rgba(201,151,44,0.18)'
              }`,
              borderRadius: 10,
            }}
          >
            <span
              style={{
                color: i === 0 ? 'var(--color-gold)' : 'var(--color-cream)',
                fontWeight: i === 0 ? 700 : 400,
                fontSize: 16,
              }}
            >
              {i + 1}. {p.name}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 800,
                color: i === 0 ? 'var(--color-gold)' : 'var(--color-cream)',
              }}
            >
              {p.score}p
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        style={{
          padding: '13px 36px',
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          borderRadius: 10,
          border: '1px solid var(--color-gold)',
          background: 'transparent',
          color: 'var(--color-gold)',
          cursor: 'pointer',
        }}
      >
        Tillbaka till lobbyn
      </button>
    </div>
  )
}

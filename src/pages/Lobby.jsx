import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../i18n'
import { useAuth } from '../features/auth/AuthContext'
import { listGames } from '../games/registry'

export default function Lobby() {
  const { t, lang, setLang } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const games = listGames()

  // Player setup state — null means no game being configured
  const [setup, setSetup] = useState(null)          // game object | null
  const [names, setNames] = useState(['', ''])       // 2–6 name inputs

  function openSetup(game) {
    setSetup(game)
    setNames(['', ''])
  }

  function closeSetup() {
    setSetup(null)
    setNames(['', ''])
  }

  function addPlayer() {
    if (names.length < 6) setNames((n) => [...n, ''])
  }

  function removeName(i) {
    if (names.length > 2) setNames((n) => n.filter((_, idx) => idx !== i))
  }

  function updateName(i, val) {
    setNames((n) => n.map((v, idx) => (idx === i ? val : v)))
  }

  function startGame() {
    const players = names.map((n) => n.trim()).filter(Boolean)
    if (players.length < 2) return
    navigate(setup.route, { state: { players } })
  }

  const validPlayerCount = names.map((n) => n.trim()).filter(Boolean).length >= 2

  return (
    <div style={{ minHeight: '100svh', background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'var(--color-wood)',
        boxShadow: '0 2px 8px rgba(44,26,14,0.35)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
          color: 'var(--color-gold)', letterSpacing: '0.03em',
        }}>
          {t('appTitle')}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Reload */}
          <button
            onClick={() => window.location.reload()}
            title="Reload"
            aria-label="Reload"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-gold-light)', fontSize: 19, lineHeight: 1,
              padding: '4px 5px', borderRadius: 4,
            }}
          >
            ↺
          </button>

          {/* Language toggle */}
          <div style={{
            display: 'flex', borderRadius: 6, overflow: 'hidden',
            border: '1px solid var(--color-gold-dark)',
          }}>
            {['sv', 'en'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  background: lang === l ? 'var(--color-gold)' : 'transparent',
                  color: lang === l ? 'var(--color-wood)' : 'var(--color-gold-light)',
                  border: 'none', cursor: 'pointer',
                  padding: '4px 9px', fontSize: 12, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >
                {l}
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* ── Game list ────────────────────────────────────────────────────── */}
      <main style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {games.map((game) => (
            <div
              key={game.id}
              style={{
                background: 'var(--color-surface)',
                border: `1px solid ${setup?.id === game.id ? 'var(--color-gold)' : 'var(--color-border)'}`,
                borderRadius: 12,
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 4, background: 'var(--color-burgundy)' }} />
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 30, lineHeight: 1 }}>{game.suit}</span>
                  <h2 style={{
                    fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
                    color: 'var(--color-burgundy)', margin: 0,
                  }}>
                    {t(game.nameKey)}
                  </h2>
                </div>
                <p style={{
                  fontSize: 14, color: 'var(--color-text-muted)',
                  margin: '0 0 14px', lineHeight: 1.5,
                }}>
                  {t(game.descriptionKey)}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {game.minPlayers}–{game.maxPlayers} {t('players').toLowerCase()}
                  </span>
                  <button
                    onClick={() => setup?.id === game.id ? closeSetup() : openSetup(game)}
                    style={{
                      background: setup?.id === game.id ? 'transparent' : 'var(--color-burgundy)',
                      color: setup?.id === game.id ? 'var(--color-burgundy)' : 'var(--color-cream)',
                      border: setup?.id === game.id ? '1px solid var(--color-burgundy)' : 'none',
                      borderRadius: 8,
                      padding: '9px 22px', fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'var(--font-display)',
                    }}
                  >
                    {setup?.id === game.id ? 'Avbryt' : t('newGame')}
                  </button>
                </div>
              </div>

              {/* ── Player setup panel ─────────────────────────────────── */}
              {setup?.id === game.id && (
                <div style={{
                  borderTop: '1px solid var(--color-border)',
                  padding: '16px 20px',
                  background: 'var(--color-bg)',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: 15, color: 'var(--color-text)', margin: '0 0 12px',
                  }}>
                    Spelare
                  </p>

                  {names.map((name, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => updateName(i, e.target.value)}
                        placeholder={`Spelare ${i + 1}`}
                        autoFocus={i === 0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && validPlayerCount) startGame()
                        }}
                        style={{
                          flex: 1, padding: '9px 12px', fontSize: 15,
                          border: '1px solid var(--color-border)', borderRadius: 8,
                          background: 'var(--color-surface)', color: 'var(--color-text)',
                          outline: 'none', fontFamily: 'inherit',
                        }}
                      />
                      {names.length > 2 && (
                        <button
                          onClick={() => removeName(i)}
                          style={{
                            padding: '0 12px', fontSize: 18, lineHeight: 1,
                            border: '1px solid var(--color-border)', borderRadius: 8,
                            background: 'transparent', color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add player / start */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {names.length < 6 && (
                      <button
                        onClick={addPlayer}
                        style={{
                          flex: 1, padding: '9px', fontSize: 14, fontWeight: 600,
                          border: '1px dashed var(--color-border)', borderRadius: 8,
                          background: 'transparent', color: 'var(--color-text-muted)',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        + Lägg till spelare
                      </button>
                    )}
                    <button
                      onClick={startGame}
                      disabled={!validPlayerCount}
                      style={{
                        flex: 2, padding: '10px', fontSize: 15, fontWeight: 700,
                        border: 'none', borderRadius: 8,
                        fontFamily: 'var(--font-display)',
                        background: validPlayerCount ? 'var(--color-burgundy)' : 'var(--color-border)',
                        color: validPlayerCount ? 'var(--color-cream)' : 'var(--color-text-muted)',
                        cursor: validPlayerCount ? 'pointer' : 'default',
                        transition: 'background 0.15s',
                      }}
                    >
                      Starta spel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

    </div>
  )
}

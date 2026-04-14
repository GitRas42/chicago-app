import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../i18n'
import { useAuth } from '../features/auth/AuthContext'
import { listGames } from '../games/registry'

export default function Lobby() {
  const { t, lang, setLang } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const games = listGames()

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

          {/* Profile */}
          {user && (
            <button
              onClick={() => navigate('/profile')}
              style={{
                background: 'none',
                border: '1px solid var(--color-gold-dark)',
                borderRadius: 20, padding: '4px 12px',
                color: 'var(--color-gold-light)', fontSize: 13,
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              {t('profile')}
            </button>
          )}
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
                border: '1px solid var(--color-border)',
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
                    onClick={() => navigate(game.route)}
                    style={{
                      background: 'var(--color-burgundy)',
                      color: 'var(--color-cream)',
                      border: 'none', borderRadius: 8,
                      padding: '9px 22px', fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'var(--font-display)',
                    }}
                  >
                    {t('newGame')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  )
}

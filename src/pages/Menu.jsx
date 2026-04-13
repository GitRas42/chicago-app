import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAppState } from '../App';
import { useAuth } from '../features/auth/AuthContext';
import { isOnline } from '../services/supabase';
import { getClaimableNames } from '../services/playerClaim';
import Button from '../components/ui/Button';

function LangButton() {
  const { lang, setLang } = useTranslation();
  return (
    <button
      onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')}
      style={{
        background: 'transparent',
        border: '1px solid rgba(200,169,110,0.4)',
        borderRadius: 20,
        padding: '6px 14px',
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--gold)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
      }}
    >
      {lang === 'sv' ? 'EN' : 'SV'}
    </button>
  );
}

function ReloadButton() {
  const handleReload = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        Promise.all(regs.map((r) => r.unregister())).then(() => window.location.reload());
      });
    } else {
      window.location.reload();
    }
  };
  return (
    <button
      onClick={handleReload}
      title="Reload app"
      style={{
        background: 'transparent',
        border: '1px solid rgba(200,169,110,0.4)',
        borderRadius: 20,
        padding: '6px 12px',
        fontSize: 15,
        color: 'var(--gold)',
        lineHeight: 1,
      }}
    >
      ↺
    </button>
  );
}

export default function Menu() {
  const { t } = useTranslation();
  const { active } = useAppState();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [claimCount, setClaimCount] = useState(0);

  useEffect(() => {
    if (user) {
      getClaimableNames(user.id).then((names) => {
        setClaimCount(names.reduce((sum, n) => sum + n.game_count, 0));
      });
    }
  }, [user]);

  return (
    <div className="fi" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-dark) 100%)',
    }}>
      {/* Hero section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 'calc(40px + env(safe-area-inset-top, 0px))',
        paddingBottom: 20,
      }}>
        {/* Decorative suit line */}
        <div style={{
          display: 'flex',
          gap: 16,
          marginBottom: 24,
          opacity: 0.25,
        }}>
          {['♣', '♦', '♠', '♥', '♣'].map((s, i) => (
            <span key={i} style={{ fontSize: 14, color: 'var(--text)' }}>{s}</span>
          ))}
        </div>

        {/* Main title */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: -2,
            color: 'var(--burgundy)',
            lineHeight: 1,
          }}>
            Chicago
          </h1>
        </div>

        {/* Decorative divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '12px 0 16px',
        }}>
          <div style={{ width: 40, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 18, color: 'var(--gold)', lineHeight: 1 }}>♠</span>
          <div style={{ width: 40, height: 1, background: 'var(--border)' }} />
        </div>

        <p style={{
          color: 'var(--muted)',
          fontSize: 15,
          fontStyle: 'italic',
          letterSpacing: 1,
        }}>
          {t("appTitle").toLowerCase() === 'kortspel' ? 'Kortspel & Poängräknare' : 'Card Game Scorer'}
        </p>

        {/* User greeting */}
        {user && profile && (
          <p style={{ color: 'var(--gold)', fontSize: 14, marginTop: 12, fontWeight: 600 }}>
            {t("welcomeBack")}, {profile.display_name}
          </p>
        )}
      </div>

      {/* Claim banner */}
      {claimCount > 0 && (
        <div
          onClick={() => navigate('/profile')}
          style={{
            margin: '0 28px 12px', padding: '12px 16px', background: 'rgba(200,169,110,0.15)',
            border: '1px solid var(--gold)', borderRadius: 10, cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            {t("unclaimedGames")} ({claimCount})
          </span>
          <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>
            {t("claim")} →
          </span>
        </div>
      )}

      {/* Button section */}
      <div style={{ padding: '0 28px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {active && (
          <Button onClick={() => navigate('/game')} v="gold" s={{
            width: '100%',
            borderRadius: 12,
            padding: '14px 20px',
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 0.3,
          }}>
            ▶ {t("resumeGame")}
          </Button>
        )}
        <Button onClick={() => navigate('/setup')} s={{
          width: '100%',
          borderRadius: 12,
          padding: '14px 20px',
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: 0.3,
        }}>
          {t("newGame")}
        </Button>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={() => navigate('/history')} v="secondary" s={{
            flex: 1,
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 15,
          }}>
            {t("history")}
          </Button>
          <Button onClick={() => navigate('/leaderboard')} v="secondary" s={{
            flex: 1,
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 15,
          }}>
            {t("leaderboard")}
          </Button>
        </div>

        <Button onClick={() => navigate('/rules')} v="ghost" s={{
          width: '100%',
          borderRadius: 12,
          padding: '12px 20px',
          fontSize: 15,
          border: '1px solid var(--border-light)',
        }}>
          {t("rules")}
        </Button>
      </div>

      {/* Footer: Auth + Language */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: '24px 0 calc(28px + env(safe-area-inset-bottom, 0px))',
      }}>
        {!loading && (
          user ? (
            <button
              onClick={() => navigate('/profile')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--burgundy)',
                letterSpacing: 0.5,
              }}
            >
              {profile?.display_name || t("profile")}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--burgundy)',
                letterSpacing: 0.5,
              }}
            >
              {t("login")}
            </button>
          )
        )}
        <LangButton />
        <ReloadButton />
      </div>
    </div>
  );
}

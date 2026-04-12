import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAppState } from '../App';
import { useAuth } from '../features/auth/AuthContext';
import { searchAllPlayers } from '../services/playerSearch';
import { isOnline } from '../services/supabase';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Setup() {
  const { t } = useTranslation();
  const { knownPlayers, setKnownPlayers, setActive } = useAppState();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [gp, setGp] = useState([]);          // player names
  const [playerMeta, setPlayerMeta] = useState({}); // { name: { userId, isRegistered } }
  const [inp, setInp] = useState('');
  const [exR, setExR] = useState(0);
  const [showS, setShowS] = useState(false);
  const [remoteSug, setRemoteSug] = useState({ registered: [], unregistered: [] });
  const debounceRef = useRef(null);

  const eff = exR || (gp.length <= 3 ? 3 : 2);

  // Local suggestions
  const localSug = knownPlayers.filter(
    (p) => !gp.includes(p) && p.toLowerCase().includes(inp.toLowerCase())
  );

  // Remote search with debounce
  useEffect(() => {
    if (!isOnline() || inp.length < 2) {
      setRemoteSug({ registered: [], unregistered: [] });
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await searchAllPlayers(inp);
      setRemoteSug(results);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [inp]);

  // Combine local + remote suggestions, deduplicate
  const allSuggestions = [];
  const seen = new Set(gp.map((p) => p.toLowerCase()));

  // Remote registered first
  for (const r of remoteSug.registered) {
    if (!seen.has(r.displayName.toLowerCase())) {
      allSuggestions.push({ name: r.displayName, userId: r.id, isRegistered: true, source: 'registered' });
      seen.add(r.displayName.toLowerCase());
    }
  }

  // Local suggestions
  for (const name of localSug) {
    if (!seen.has(name.toLowerCase())) {
      allSuggestions.push({ name, source: 'local' });
      seen.add(name.toLowerCase());
    }
  }

  // Remote unregistered
  for (const u of remoteSug.unregistered) {
    if (!seen.has(u.displayName.toLowerCase())) {
      allSuggestions.push({ name: u.displayName, source: 'played_before' });
      seen.add(u.displayName.toLowerCase());
    }
  }

  const add = (name, meta = {}) => {
    const x = name.trim();
    if (!x || gp.includes(x)) return;
    setGp([...gp, x]);
    if (meta.userId || meta.isRegistered) {
      setPlayerMeta((prev) => ({ ...prev, [x]: meta }));
    }
    if (!knownPlayers.includes(x)) setKnownPlayers([...knownPlayers, x]);
    setInp('');
    setShowS(false);
  };

  const remove = (name) => {
    setGp(gp.filter((x) => x !== name));
    setPlayerMeta((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const go = () => {
    if (gp.length < 2) return;
    const sc = {};
    gp.forEach((p) => (sc[p] = 0));

    // If logged in and user not in game, auto-add meta for them
    const meta = { ...playerMeta };
    if (user && profile) {
      const userInGame = gp.find((p) => p === profile.display_name);
      if (userInGame && !meta[userInGame]) {
        meta[userInGame] = { userId: user.id, isRegistered: true };
      }
    }

    setActive({
      id: Date.now(),
      gameType: 'chicago',
      players: gp,
      exchangeRounds: eff,
      scores: sc,
      currentRound: 1,
      currentStep: 0,
      chicagoPlayer: null,
      roundEvents: [],
      allRounds: [],
      snapshots: [],
      startedAt: new Date().toISOString(),
      playerMeta: meta,
    });
    navigate('/game');
  };

  return (
    <div className="fi">
      <Header title={t("newGame")} onBack={() => navigate('/')} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, marginBottom: 12 }}>
            {t("players")} ({gp.length})
          </h3>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={inp}
                onChange={(e) => { setInp(e.target.value); setShowS(true); }}
                onFocus={() => setShowS(true)}
                onKeyDown={(e) => e.key === 'Enter' && add(inp)}
                placeholder={t("playerName")}
                style={{
                  flex: 1, padding: '10px 12px', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 16, background: 'var(--white)', color: 'var(--text)', outline: 'none',
                }}
              />
              <Button onClick={() => add(inp)} small>+</Button>
            </div>
            {showS && allSuggestions.length > 0 && inp.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--white)',
                border: '1px solid var(--border)', borderRadius: 8, marginTop: 4, zIndex: 10,
                boxShadow: '0 4px 12px var(--shadow)', maxHeight: 200, overflow: 'auto',
              }}>
                {allSuggestions.map((s) => (
                  <div
                    key={s.name + s.source}
                    onClick={() => add(s.name, s.userId ? { userId: s.userId, isRegistered: true } : {})}
                    style={{
                      padding: '10px 14px', cursor: 'pointer',
                      borderBottom: '1px solid var(--border-light)', fontSize: 15,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <span>{s.name}</span>
                    {s.source === 'registered' && (
                      <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>
                        {t("registered")}
                      </span>
                    )}
                    {s.source === 'played_before' && (
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                        {t("playedBefore")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {gp.map((p, i) => (
              <div key={p} className="pi" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', background: 'var(--bg-dark)', borderRadius: 8,
              }}>
                <span style={{ fontWeight: 600 }}>
                  {i + 1}. {p}
                  {playerMeta[p]?.isRegistered && (
                    <span style={{ fontSize: 11, color: 'var(--green)', marginLeft: 6 }}>●</span>
                  )}
                </span>
                <button
                  onClick={() => remove(p)}
                  style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 14, fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {gp.length > 5 && (
            <p style={{ color: 'var(--burgundy)', fontSize: 13, marginTop: 8, fontWeight: 600 }}>
              ⚠ {t("warning5Players")}
            </p>
          )}
        </Card>
        <Card>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, marginBottom: 12 }}>
            {t("exchangeRounds")}
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {[0, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setExR(n)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 8, fontSize: 15, fontWeight: 600,
                  border: exR === n ? '2px solid var(--burgundy)' : '1px solid var(--border)',
                  background: exR === n ? 'var(--burgundy)' : 'var(--card)',
                  color: exR === n ? 'var(--white)' : 'var(--text)',
                }}
              >
                {n === 0 ? `${t("auto")} (${gp.length <= 3 ? 3 : 2})` : n}
              </button>
            ))}
          </div>
        </Card>
        <Button onClick={go} disabled={gp.length < 2} s={{ width: '100%', marginTop: 8 }}>
          {t("start")} — {gp.length} {t("players").toLowerCase()}, {eff} {t("exchangeRounds").toLowerCase()}
        </Button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAuth } from '../features/auth/AuthContext';
import { getClaimableNames, claimPlayerName, getClaimHistory } from '../services/playerClaim';
import { useToast } from '../components/ui/Toast';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

export default function Profile() {
  const { t } = useTranslation();
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fire = useToast();

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [claimable, setClaimable] = useState([]);
  const [claimHistory, setClaimHistory] = useState([]);
  const [claiming, setClaiming] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getClaimableNames(user.id).then(setClaimable);
    getClaimHistory(user.id).then(setClaimHistory);
  }, [user]);

  if (!user || !profile) {
    navigate('/login');
    return null;
  }

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ display_name: newName.trim() });
      fire(t("profileUpdated"));
      setEditing(false);
    } catch {
      fire(t("errorOccurred"));
    } finally {
      setSaving(false);
    }
  };

  const handleClaim = async (name) => {
    try {
      const count = await claimPlayerName(user.id, name);
      fire(`${t("claimed")} ${count} ${t("gamesPlayed").toLowerCase()}`);
      setClaimable((prev) => prev.filter((c) => c.player_name !== name));
      setClaiming(null);
      getClaimHistory(user.id).then(setClaimHistory);
    } catch {
      fire(t("errorOccurred"));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 16, background: 'var(--white)', color: 'var(--text)', outline: 'none',
  };

  return (
    <div className="fi">
      <Header title={t("profile")} onBack={() => navigate('/')} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Profile info */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800 }}>
              {profile.display_name}
            </h3>
            <button
              onClick={() => { setEditing(true); setNewName(profile.display_name); }}
              style={{ background: 'none', border: 'none', color: 'var(--burgundy)', fontSize: 14, fontWeight: 600 }}
            >
              {t("editScore")}
            </button>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>{user.email}</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            {t("memberSince")} {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </Card>

        {/* Claimable games */}
        {claimable.length > 0 && (
          <Card style={{ border: '2px solid var(--gold)', background: 'rgba(200,169,110,0.08)' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, marginBottom: 10, color: 'var(--gold)' }}>
              {t("claimGames")}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>
              {t("claimDescription")}
            </p>
            {claimable.map((c) => (
              <div key={c.player_name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderTop: '1px solid var(--border-light)',
              }}>
                <div>
                  <span style={{ fontWeight: 700 }}>{c.player_name}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 8 }}>
                    {c.game_count} {t("gamesPlayed").toLowerCase()}
                  </span>
                </div>
                <Button onClick={() => setClaiming(c)} small v="gold">
                  {t("claim")}
                </Button>
              </div>
            ))}
          </Card>
        )}

        {/* Claim history */}
        {claimHistory.length > 0 && (
          <Card>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, marginBottom: 10 }}>
              {t("claimHistoryTitle")}
            </h3>
            {claimHistory.map((c) => (
              <div key={c.id} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 14,
                padding: '6px 0', borderTop: '1px solid var(--border-light)',
              }}>
                <span>{c.claimed_name}</span>
                <span style={{ color: 'var(--muted)' }}>
                  {c.game_count} {t("gamesPlayed").toLowerCase()} · {new Date(c.claimed_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </Card>
        )}

        {/* Sign out */}
        <Button onClick={handleSignOut} v="ghost" s={{ width: '100%' }}>
          {t("signOut")}
        </Button>
      </div>

      {/* Edit name modal */}
      {editing && (
        <Modal onClose={() => setEditing(false)}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, marginBottom: 14 }}>
            {t("displayName")}
          </h3>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={inputStyle}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <Button onClick={() => setEditing(false)} v="ghost" s={{ flex: 1 }}>{t("cancel")}</Button>
            <Button onClick={handleUpdateName} disabled={saving} s={{ flex: 1 }}>
              {saving ? '...' : t("save")}
            </Button>
          </div>
        </Modal>
      )}

      {/* Claim confirmation modal */}
      {claiming && (
        <Modal onClose={() => setClaiming(null)}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, marginBottom: 12 }}>
              {t("confirmClaim")}
            </h3>
            <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 16 }}>
              {t("claimConfirmText")} <strong>{claiming.player_name}</strong>?
            </p>
            <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 20 }}>
              {claiming.game_count} {t("gamesPlayed").toLowerCase()}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => setClaiming(null)} v="ghost" s={{ flex: 1 }}>{t("cancel")}</Button>
              <Button onClick={() => handleClaim(claiming.player_name)} v="gold" s={{ flex: 1 }}>
                {t("claim")}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

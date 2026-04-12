import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from '../../i18n';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function Signup() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, displayName);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 16, background: 'var(--white)', color: 'var(--text)',
    outline: 'none', fontFamily: 'inherit',
  };

  if (success) {
    return (
      <div className="fi">
        <Header title={t("signup")} onBack={() => navigate('/')} />
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Card>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✉</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, marginBottom: 8 }}>
              {t("checkEmail")}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>
              {t("confirmEmailSent")}
            </p>
            <Button onClick={() => navigate('/login')} s={{ width: '100%', marginTop: 20 }}>
              {t("login")}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="fi">
      <Header title={t("signup")} onBack={() => navigate('/')} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--muted)' }}>
                {t("displayName")}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--muted)' }}>
                {t("email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--muted)' }}>
                {t("password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("minChars")}
                style={inputStyle}
                required
              />
            </div>
            {error && (
              <p style={{ color: 'var(--red)', fontSize: 14, fontWeight: 600 }}>{error}</p>
            )}
            <Button disabled={loading} s={{ width: '100%' }}>
              {loading ? '...' : t("signup")}
            </Button>
          </form>
        </Card>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: 'var(--burgundy)', fontSize: 15, fontWeight: 600, textDecoration: 'underline' }}
          >
            {t("hasAccountLogin")}
          </button>
        </div>
      </div>
    </div>
  );
}

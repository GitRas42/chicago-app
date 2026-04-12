import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from '../../i18n';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function Login() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
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

  return (
    <div className="fi">
      <Header title={t("login")} onBack={() => navigate('/')} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                style={inputStyle}
                required
              />
            </div>
            {error && (
              <p style={{ color: 'var(--red)', fontSize: 14, fontWeight: 600 }}>{error}</p>
            )}
            <Button disabled={loading} s={{ width: '100%' }}>
              {loading ? '...' : t("login")}
            </Button>
          </form>
        </Card>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/signup')}
            style={{ background: 'none', border: 'none', color: 'var(--burgundy)', fontSize: 15, fontWeight: 600, textDecoration: 'underline' }}
          >
            {t("noAccountSignup")}
          </button>
        </div>
      </div>
    </div>
  );
}

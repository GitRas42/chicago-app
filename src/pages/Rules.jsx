import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import Header from '../components/ui/Header';
import Card from '../components/ui/Card';
import { sections, scoringRows } from '../games/chicago/rules';

function LangButton() {
  const { lang, setLang } = useTranslation();
  return (
    <button
      onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')}
      style={{
        background: 'var(--bg-dark)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '5px 10px',
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--muted)',
        letterSpacing: 1,
      }}
    >
      {lang === 'sv' ? 'EN' : 'SV'}
    </button>
  );
}

export default function Rules({ inGame, onBack }) {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  const handleBack = inGame ? onBack : () => navigate('/');

  return (
    <div className="fi">
      <Header
        title={t("rulesTitle")}
        onBack={handleBack}
        right={!inGame ? <LangButton /> : null}
      />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 40 }}>
        <Card><p style={{ fontSize: 15, lineHeight: 1.7 }}>{t("rulesIntro")}</p></Card>
        {sections.map(([h, b]) => (
          <Card key={h}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, marginBottom: 6, color: 'var(--burgundy)' }}>
              {t(h)}
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7 }}>{t(b)}</p>
          </Card>
        ))}
        <Card>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, marginBottom: 10, color: 'var(--burgundy)' }}>
            {t("rulesScoring")}
          </h3>
          {scoringRows.map(([id, pts]) => (
            <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: 15 }}>{t(id)}</span>
              <span style={{ fontWeight: 700, color: 'var(--burgundy)' }}>{pts}{t("pt")}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span>{t("lastTrick")}</span><span style={{ fontWeight: 700, color: 'var(--burgundy)' }}>5{t("pt")}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span>{t("lastTrickTwo")}</span><span style={{ fontWeight: 700, color: 'var(--burgundy)' }}>10{t("pt")}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span>Chicago</span><span style={{ fontWeight: 700, color: 'var(--burgundy)' }}>±15{t("pt")}</span>
          </div>
          <div style={{
            marginTop: 10, padding: '10px 12px',
            background: 'linear-gradient(135deg, rgba(200,169,110,0.19), rgba(139,26,43,0.08))',
            borderRadius: 8, textAlign: 'center',
          }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>👑 {t("royalFlush")} — {t("rulesRoyal")}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

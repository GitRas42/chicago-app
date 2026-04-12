const variants = {
  primary: { background: 'var(--burgundy)', color: 'var(--white)', border: 'none' },
  secondary: { background: 'transparent', color: 'var(--burgundy)', border: '2px solid var(--burgundy)' },
  gold: { background: 'var(--gold)', color: 'var(--text)', border: 'none' },
  ghost: { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' },
  danger: { background: 'var(--red)', color: 'var(--white)', border: 'none' },
  success: { background: 'var(--green)', color: 'var(--white)', border: 'none' },
  royal: { background: 'linear-gradient(135deg, var(--gold) 0%, var(--burgundy) 100%)', color: 'var(--white)', border: 'none' },
};

export default function Button({ children, onClick, v = "primary", disabled, s = {}, small }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        ...variants[v],
        padding: small ? '8px 14px' : '12px 20px',
        borderRadius: 8,
        fontSize: small ? 14 : 16,
        fontWeight: 600,
        opacity: disabled ? 0.35 : 1,
        transition: 'all .15s',
        ...s,
      }}
    >
      {children}
    </button>
  );
}

export default function Card({ children, style: sx = {}, onClick, flash }) {
  return (
    <div
      onClick={onClick}
      className={flash ? "fl" : ""}
      style={{
        background: 'var(--card)',
        borderRadius: 10,
        border: '1px solid var(--border)',
        padding: 16,
        boxShadow: '0 2px 8px var(--shadow)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all .15s',
        ...sx,
      }}
    >
      {children}
    </div>
  );
}

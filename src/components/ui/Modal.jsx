export default function Modal({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44,24,16,.55)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pi"
        style={{
          background: 'var(--card)',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 360,
          boxShadow: '0 8px 32px rgba(44,24,16,.3)',
          border: '1px solid var(--border)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

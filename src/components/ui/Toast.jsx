import { useState, useCallback, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const fire = useCallback((msg) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2300);
  }, []);

  return (
    <ToastContext.Provider value={fire}>
      {children}
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast"
          style={{
            position: 'fixed',
            bottom: 90,
            left: '50%',
            zIndex: 200,
            background: 'var(--text)',
            color: 'var(--white)',
            padding: '10px 26px',
            borderRadius: 24,
            fontSize: 15,
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,.35)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {t.msg}
        </div>
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

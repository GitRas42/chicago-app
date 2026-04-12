export default function StepProgress({ steps, currentStep, done }) {
  return (
    <div style={{ padding: '12px 16px 4px', display: 'flex', gap: 4 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div
            style={{
              width: '100%',
              height: 5,
              borderRadius: 3,
              background: i < currentStep ? 'var(--burgundy)' : i === currentStep && !done ? 'var(--gold)' : 'var(--border-light)',
              transition: 'background .3s',
            }}
          />
          <span
            style={{
              fontSize: 10,
              color: i < currentStep ? 'var(--burgundy)' : i === currentStep ? 'var(--text)' : 'var(--muted)',
              fontWeight: i === currentStep ? 700 : 400,
            }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export const BackgroundBlobs = () => (
  <div
    aria-hidden="true"
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 70%)',
        borderRadius: '50%',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: '-15%',
        right: '-10%',
        width: '55vw',
        height: '55vw',
        background: 'radial-gradient(circle, hsl(var(--accent) / 0.03) 0%, transparent 70%)',
        borderRadius: '50%',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: '45%',
        left: '55%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, hsl(var(--primary) / 0.025) 0%, transparent 70%)',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    />
  </div>
);

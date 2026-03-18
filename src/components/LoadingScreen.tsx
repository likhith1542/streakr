export function LoadingScreen() {
  return (
    <div
      className="flex items-center justify-center h-screen w-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl streak-flame">🔥</div>
        <p
          className="font-display text-lg font-semibold tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          Loading Streakr…
        </p>
      </div>
    </div>
  );
}

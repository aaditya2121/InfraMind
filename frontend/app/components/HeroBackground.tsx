// HeroBackground is now a lightweight passthrough wrapper.
// The actual animated background (blobs, particles, scan lines, icons)
// lives in GlobalBackground, which is mounted in the root layout so it
// starts immediately on first page load — independent of route transitions.

export default function HeroBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10">
      {children}
    </div>
  );
}

import { useGameStore } from "../stores/gameStore";

export function WaitingState() {
  const autoLockAgent = useGameStore((s) => s.autoLockAgent);

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">
      {/* Pulse animation */}
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 bg-card rounded-full" />
        <div className="absolute inset-4 bg-accent-cyan rounded-full animate-pulse" />
      </div>

      <h2 className="text-base font-semibold text-primary mb-1">Maç Bekleniyor</h2>
      <p className="text-xs text-dim">Oyun başladığında otomatik algılanacak</p>

      {autoLockAgent && (
        <div className="mt-6 px-4 py-2 bg-card rounded-md text-center">
          <span className="text-[11px] text-dim block">Auto-Lock Aktif</span>
          <span className="text-sm font-black text-success">{autoLockAgent.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}

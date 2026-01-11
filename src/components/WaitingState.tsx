import { useGameStore } from "../stores/gameStore";
import { useI18n } from "../lib/i18n";

export function WaitingState() {
  const autoLockAgent = useGameStore((s) => s.autoLockAgent);
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">
      {/* Pulse animation */}
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 bg-card rounded-full" />
        <div className="absolute inset-4 bg-accent-cyan rounded-full animate-pulse" />
      </div>

      <h2 className="text-base font-semibold text-primary mb-1">{t("waiting.title")}</h2>
      <p className="text-xs text-dim">{t("waiting.desc")}</p>

      {autoLockAgent && (
        <div className="mt-6 px-4 py-2 bg-card rounded-md text-center">
          <span className="text-[11px] text-dim block">{t("footer.autoLock")}</span>
          <span className="text-sm font-black text-success">{autoLockAgent.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}

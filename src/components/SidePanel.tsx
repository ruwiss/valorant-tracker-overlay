import { useEffect } from "react";
import { usePanelStore } from "../stores/panelStore";
import { SettingsPanel } from "./SettingsPanel";
import { PlayerPanel } from "./PlayerPanel";
import { useI18n } from "../lib/i18n";

export function SidePanel() {
  const { isOpen, panelType, close } = usePanelStore();
  const { t } = useI18n();

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const title = panelType === "settings" ? t("settings.title") : t("player.weaponSkins");

  return (
    <div className="w-[260px] h-full bg-[#0a0e13] border-l-2 border-accent-cyan/30 flex flex-col shadow-[-4px_0_20px_rgba(0,212,170,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-[#0d1117]">
        <span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">{title}</span>
        <button onClick={close} className="w-6 h-6 flex items-center justify-center text-dim hover:text-accent-red hover:bg-accent-red/10 rounded transition-colors" title="Close">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {panelType === "settings" && <SettingsPanel />}
        {panelType === "player" && <PlayerPanel />}
      </div>

      {/* Bottom accent line */}
      <div className="h-0.5 bg-linear-to-r from-transparent via-accent-cyan/50 to-transparent" />
    </div>
  );
}

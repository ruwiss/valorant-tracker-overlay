import { useGameStore } from "../stores/gameStore";
import { usePanelStore } from "../stores/panelStore";
import { useI18n } from "../lib/i18n";

export function Footer() {
  const { autoLockAgent } = useGameStore();
  const { isOpen, panelType, openSettings, close } = usePanelStore();
  const { t } = useI18n();

  const handleSettingsClick = () => {
    if (isOpen && panelType === "settings") {
      close();
    } else {
      openSettings();
    }
  };

  return (
    <footer className="flex items-center justify-between px-4 h-10 bg-card rounded-md mt-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-dim">{t("footer.autoLock")}:</span>
        <span className={`text-[11px] font-semibold ${autoLockAgent ? "text-success" : "text-secondary"}`}>{autoLockAgent?.toUpperCase() || t("footer.off")}</span>
      </div>
      <button
        onClick={handleSettingsClick}
        className={`w-8 h-8 flex items-center justify-center rounded-md cursor-pointer border transition-colors ${isOpen && panelType === "settings" ? "text-accent-cyan bg-accent-cyan/20 border-accent-cyan" : "text-accent-cyan hover:bg-accent-cyan/20 bg-card-hover border-border"}`}
        title={t("settings.title")}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </footer>
  );
}

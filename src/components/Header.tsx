import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { StatusIndicator } from "./StatusIndicator";
import { useGameStore } from "../stores/gameStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useAssetsStore } from "../stores/assetsStore";
import { useUpdateStore } from "../stores/updateStore";
import { useI18n } from "../lib/i18n";

export function Header() {
  const { connected, region, gameState, reconnect } = useGameStore();
  const { hotkey } = useSettingsStore();
  const { getMapSplash } = useAssetsStore();
  const { updateAvailable, updateVersion, isDownloading, downloadProgress, checkForUpdate, downloadAndInstall } = useUpdateStore();
  const { t } = useI18n();

  // Check for updates on mount
  useEffect(() => {
    checkForUpdate();
  }, []);

  const status = !connected ? "error" : gameState.state === "pregame" ? "pregame" : gameState.state === "ingame" ? "ingame" : "connected";
  const mapSplash = gameState.map_name ? getMapSplash(gameState.map_name) : null;

  const closeApp = async () => {
    await getCurrentWindow().close();
  };

  const startDrag = async (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    try {
      await getCurrentWindow().startDragging();
    } catch (err) {
      console.error("Drag failed:", err);
    }
  };

  return (
    <header className="relative flex items-center justify-between px-4 py-3 cursor-move select-none overflow-hidden rounded-lg" onMouseDown={startDrag}>
      {/* Map backdrop */}
      {mapSplash && (
        <div
          className="absolute inset-0 z-0 transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `url(${mapSplash})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.12,
            filter: "blur(1px)",
          }}
        />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-linear-to-r from-dark/90 via-dark/70 to-dark/90 pointer-events-none" />

      <div className="relative z-10 flex items-center gap-2 pointer-events-none">
        <svg className="w-6 h-6 text-accent-red" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
        <div>
          <h1 className="text-base font-black text-primary tracking-tight">VALORANT</h1>
          <span className="text-[9px] text-dim">{hotkey} Overlay</span>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2">
        {region && <span className="text-[10px] font-semibold text-accent-cyan pointer-events-none">{region}</span>}
        <StatusIndicator status={status} />

        {/* Update Button */}
        {updateAvailable && (
          <button onClick={downloadAndInstall} disabled={isDownloading} className="w-7 h-7 flex items-center justify-center text-accent-gold hover:bg-accent-gold/20 rounded-md transition-colors relative" title={isDownloading ? `${downloadProgress}%` : `${t("header.update")} v${updateVersion}`}>
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            )}
          </button>
        )}

        <button onClick={reconnect} className="w-7 h-7 flex items-center justify-center text-secondary hover:bg-card-hover rounded-md transition-colors" title={t("header.reconnect")}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
        <button onClick={closeApp} className="w-7 h-7 flex items-center justify-center text-accent-red hover:bg-accent-red/20 rounded-md transition-colors" title={t("header.close")}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </header>
  );
}

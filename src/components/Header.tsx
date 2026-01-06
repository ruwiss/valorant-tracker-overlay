import { getCurrentWindow } from "@tauri-apps/api/window";
import { StatusIndicator } from "./StatusIndicator";
import { useGameStore } from "../stores/gameStore";

export function Header() {
  const { connected, region, gameState, reconnect } = useGameStore();

  const status = !connected ? "error" : gameState.state === "pregame" ? "pregame" : gameState.state === "ingame" ? "ingame" : "connected";

  const closeApp = async () => {
    await getCurrentWindow().close();
  };

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-accent-red" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
        <div>
          <h1 className="text-base font-black text-primary tracking-tight">VALORANT</h1>
          <span className="text-[9px] text-dim">F2 Overlay</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {region && <span className="text-[10px] font-semibold text-accent-cyan">{region}</span>}
        <span className="text-[11px] text-secondary">{connected ? "Bağlandı" : "Bağlanıyor..."}</span>
        <StatusIndicator status={status} />
        <button onClick={reconnect} className="w-7 h-7 flex items-center justify-center text-secondary hover:bg-card-hover rounded-md transition-colors" title="Yeniden Bağlan">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
        <button onClick={closeApp} className="w-7 h-7 flex items-center justify-center text-accent-red hover:bg-accent-red/20 rounded-md transition-colors" title="Kapat">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </header>
  );
}

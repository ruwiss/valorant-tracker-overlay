import { useGameStore } from "../stores/gameStore";

interface Props {
  onOpenAgentLock: () => void;
  onOpenApiSettings: () => void;
}

export function Footer({ onOpenAgentLock, onOpenApiSettings }: Props) {
  const { autoLockAgent } = useGameStore();

  return (
    <footer className="flex items-center justify-between px-4 h-10 bg-card rounded-md mt-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-dim">AUTO-LOCK:</span>
        <span className={`text-[11px] font-semibold ${autoLockAgent ? "text-success" : "text-secondary"}`}>{autoLockAgent?.toUpperCase() || "OFF"}</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onOpenAgentLock} className="w-7 h-7 flex items-center justify-center text-secondary hover:bg-card-hover rounded cursor-pointer bg-transparent border-none" title="Ajan Kilitleme">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
        <button onClick={onOpenApiSettings} className="w-7 h-7 flex items-center justify-center text-secondary hover:bg-card-hover rounded cursor-pointer bg-transparent border-none" title="API Ayarları">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>
    </footer>
  );
}

import { useGameStore } from "../stores/gameStore";
import { AGENTS, AGENT_COLORS } from "../lib/constants";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AgentLockModal({ open, onClose }: Props) {
  const { autoLockAgent, setAutoLock } = useGameStore();

  if (!open) return null;

  const selectAgent = (agent: string | null) => {
    setAutoLock(agent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-[360px] max-h-[480px] bg-dark rounded-lg border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-4 text-center border-b border-border">
          <h2 className="text-base font-black text-primary">Auto-Lock Ajan</h2>
          <p className="text-[11px] text-dim mt-1">Maç başladığında otomatik kilitlenecek ajan</p>
        </div>

        <div className="p-4 max-h-[320px] overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {AGENTS.map((agent) => {
              const isSelected = autoLockAgent === agent;
              const color = AGENT_COLORS[agent] || "#768079";

              return (
                <button key={agent} onClick={() => selectAgent(agent)} className={`h-9 rounded-md text-[11px] font-semibold transition-all border ${isSelected ? "bg-card-hover border-accent-cyan" : "bg-transparent border-border hover:bg-card-hover"}`} style={{ color }}>
                  {agent.charAt(0).toUpperCase() + agent.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-4">
          <button onClick={() => selectAgent(null)} className="w-full h-10 rounded-md text-xs font-semibold text-secondary border border-border hover:bg-card-hover transition-colors">
            Auto-Lock Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

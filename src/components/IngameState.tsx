import { useState } from "react";
import { PlayerCard } from "./PlayerCard";
import { PlayerStatsModal } from "./PlayerStatsModal";
import { useGameStore } from "../stores/gameStore";
import type { PlayerData } from "../lib/types";

export function IngameState() {
  const { gameState } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-black text-accent-red">AKTİF MAÇ</span>
        {gameState.map_name && <span className="text-xs font-semibold text-secondary">{gameState.map_name}</span>}
      </div>

      {/* Allies */}
      <div className="mb-1">
        <span className="text-[10px] font-semibold text-accent-cyan">TAKIM</span>
      </div>
      <div className="space-y-1 mb-3">
        {gameState.allies.map((player) => (
          <PlayerCard key={player.puuid} player={player} onSelect={setSelectedPlayer} />
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-border my-3" />

      {/* Enemies */}
      <div className="mb-1">
        <span className="text-[10px] font-semibold text-accent-red">DÜŞMAN</span>
      </div>
      <div className="space-y-1">
        {gameState.enemies.map((player) => (
          <PlayerCard key={player.puuid} player={player} onSelect={setSelectedPlayer} />
        ))}
      </div>

      <PlayerStatsModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </div>
  );
}

import type { PlayerData } from "../lib/types";
import { AGENT_COLORS, RANK_TIERS, PARTY_COLORS } from "../lib/constants";

interface Props {
  player: PlayerData;
  onSelect?: (player: PlayerData) => void;
}

export function PlayerCard({ player, onSelect }: Props) {
  const agentColor = AGENT_COLORS[player.agent.toLowerCase()] || "#768079";
  const [rankName, rankColor] = RANK_TIERS[player.rank_tier] || ["", "#768079"];
  const partyIndex = player.party.startsWith("Grup-") ? parseInt(player.party.split("-")[1]) - 1 : -1;
  const partyColor = partyIndex >= 0 ? PARTY_COLORS[partyIndex % 4] : null;

  const statusColor = player.locked ? "bg-success" : player.agent ? "bg-warning" : "bg-dim";

  return (
    <div className={`relative flex items-center h-10 px-3 rounded-md transition-colors cursor-pointer ${player.is_me ? "bg-[#1e2a36]" : "bg-card hover:bg-card-hover"}`} onClick={() => onSelect?.(player)}>
      {/* Party indicator */}
      {partyColor && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-sm" style={{ backgroundColor: partyColor }} />}

      {/* Status dot */}
      <div className={`w-1.5 h-1.5 rounded-full ${statusColor} ml-2`} />

      {/* Agent */}
      <span className="w-16 ml-2 text-[11px] font-semibold truncate" style={{ color: player.agent ? agentColor : "#4a5568" }}>
        {player.agent ? player.agent.charAt(0).toUpperCase() + player.agent.slice(1) : "—"}
      </span>

      {/* Name */}
      <span className={`flex-1 text-xs font-semibold truncate ${player.is_me ? "text-accent-gold" : "text-primary"}`}>{player.name}</span>

      {/* Level */}
      {player.level > 0 && <span className="text-[10px] text-dim mr-2">Lvl {player.level}</span>}

      {/* Rank */}
      {player.rank_tier > 0 && (
        <span className="text-[11px] font-medium" style={{ color: rankColor }}>
          {rankName}
        </span>
      )}
    </div>
  );
}

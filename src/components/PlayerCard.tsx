import type { PlayerData } from "../lib/types";
import { AGENT_COLORS, RANK_TIERS, PARTY_COLORS } from "../lib/constants";
import { useI18n } from "../lib/i18n";
import { useAssetsStore } from "../stores/assetsStore";
import { usePanelStore } from "../stores/panelStore";

interface Props {
  player: PlayerData;
}

export function PlayerCard({ player }: Props) {
  const { t } = useI18n();
  const { getAgentIcon } = useAssetsStore();
  const { openPlayer } = usePanelStore();

  const agentColor = AGENT_COLORS[player.agent?.toLowerCase()] || "#768079";
  const [rankName, rankColor] = RANK_TIERS[player.rank_tier] || ["", "#768079"];
  const partyIndex = player.party.startsWith("Grup-") || player.party.startsWith("Group-") ? parseInt(player.party.split("-")[1]) - 1 : -1;
  const partyColor = partyIndex >= 0 ? PARTY_COLORS[partyIndex % 4] : null;
  const agentIcon = player.agent ? getAgentIcon(player.agent) : null;

  const statusColor = player.locked ? "bg-success" : player.agent ? "bg-warning" : "bg-dim";

  return (
    <div className={`relative flex items-center h-10 px-2 rounded-md transition-colors cursor-pointer ${player.is_me ? "bg-[#1e2a36]" : "bg-card hover:bg-card-hover"}`} onClick={() => openPlayer(player)}>
      {/* Party indicator */}
      {partyColor && <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-sm" style={{ backgroundColor: partyColor }} />}

      {/* Agent icon or status dot */}
      <div className="w-7 h-7 flex items-center justify-center ml-1">
        {agentIcon ? (
          <img
            src={agentIcon}
            alt={player.agent}
            className="w-6 h-6 rounded-full object-cover"
            style={{
              boxShadow: `0 0 8px ${agentColor}40`,
              border: `1.5px solid ${agentColor}60`,
            }}
          />
        ) : (
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        )}
      </div>

      {/* Agent name */}
      <span className="w-14 ml-1 text-[10px] font-semibold truncate" style={{ color: player.agent ? agentColor : "#4a5568" }}>
        {player.agent ? player.agent.charAt(0).toUpperCase() + player.agent.slice(1) : "—"}
      </span>

      {/* Name */}
      <span className={`flex-1 text-xs font-semibold truncate ${player.is_me ? "text-accent-gold" : "text-primary"}`}>{player.name}</span>

      {/* Level */}
      {player.level > 0 && (
        <span className="text-[10px] text-dim mr-2">
          {t("player.level")} {player.level}
        </span>
      )}

      {/* Rank */}
      {player.rank_tier > 0 && (
        <span className="text-[11px] font-medium" style={{ color: rankColor }}>
          {rankName}
        </span>
      )}
    </div>
  );
}

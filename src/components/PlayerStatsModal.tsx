import { useState, useEffect } from "react";
import type { PlayerData } from "../lib/types";
import { useGameStore } from "../stores/gameStore";

interface Props {
  player: PlayerData | null;
  onClose: () => void;
}

interface PlayerStats {
  matches: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  bodyshots: number;
  legshots: number;
  damage: number;
  rounds: number;
}

export function PlayerStatsModal({ player, onClose }: Props) {
  const { henrikApiKey } = useGameStore();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!player) return;
    fetchStats();
  }, [player]);

  const fetchStats = async () => {
    if (!player) return;

    if (!henrikApiKey) {
      setError("API key gerekli - Ayarlar'dan ekleyin");
      return;
    }

    const nameParts = player.name.split("#");
    if (nameParts.length !== 2) {
      setError("Geçersiz oyuncu ismi");
      return;
    }

    const [name, tag] = nameParts;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://api.henrikdev.xyz/valorant/v3/matches/eu/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?mode=competitive&size=10`, {
        headers: { Authorization: henrikApiKey },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Geçersiz API key");
        } else if (res.status === 404) {
          setError("Oyuncu bulunamadı");
        } else if (res.status === 429) {
          setError("Rate limit - biraz bekleyin");
        } else {
          setError("API hatası");
        }
        setLoading(false);
        return;
      }

      const json = await res.json();
      const matches = json.data || [];

      if (matches.length === 0) {
        setError("Maç verisi bulunamadı");
        setLoading(false);
        return;
      }

      // Aggregate stats
      const aggregated: PlayerStats = {
        matches: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
        headshots: 0,
        bodyshots: 0,
        legshots: 0,
        damage: 0,
        rounds: 0,
      };

      for (const match of matches) {
        const players = match.players?.all_players || match.players || [];
        const me = players.find((p: any) => p.name?.toLowerCase() === name.toLowerCase() && p.tag?.toLowerCase() === tag.toLowerCase());

        if (!me) continue;

        aggregated.matches++;
        aggregated.kills += me.stats?.kills || 0;
        aggregated.deaths += me.stats?.deaths || 0;
        aggregated.assists += me.stats?.assists || 0;
        aggregated.headshots += me.stats?.headshots || 0;
        aggregated.bodyshots += me.stats?.bodyshots || 0;
        aggregated.legshots += me.stats?.legshots || 0;
        aggregated.damage += me.damage_made || me.stats?.damage?.dealt || 0;
        aggregated.rounds += match.metadata?.rounds_played || 0;

        // Check win
        const myTeam = me.team;
        const teams = match.teams;
        if (teams) {
          const teamData = teams[myTeam?.toLowerCase()] || teams.red || teams.blue;
          if (teamData?.has_won || teamData?.won) {
            aggregated.wins++;
          }
        }
      }

      setStats(aggregated);
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  const copyName = () => {
    if (player) {
      navigator.clipboard.writeText(player.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (!player) return null;

  const totalShots = stats ? stats.headshots + stats.bodyshots + stats.legshots : 0;
  const hsPercent = totalShots > 0 ? ((stats!.headshots / totalShots) * 100).toFixed(1) : "0";
  const kd = stats && stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats?.kills.toFixed(2) || "0";
  const adr = stats && stats.rounds > 0 ? (stats.damage / stats.rounds).toFixed(0) : "0";
  const winRate = stats && stats.matches > 0 ? ((stats.wins / stats.matches) * 100).toFixed(0) : "0";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-[320px] bg-dark rounded-lg border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <button onClick={copyName} className="text-sm font-bold text-primary hover:text-accent-cyan transition-colors text-left" title="Kopyala">
              {player.name}
            </button>
            {copied && <span className="text-[10px] text-success">Kopyalandı!</span>}
          </div>
          <div className="text-[10px] text-dim mt-0.5">Son 10 Rekabetçi Maç</div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-6">
              <span className="text-error text-sm">{error}</span>
            </div>
          )}

          {stats && !loading && !error && (
            <div className="space-y-3">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <StatBox label="HS%" value={`${hsPercent}%`} color="text-accent-red" />
                <StatBox label="K/D" value={kd} color="text-accent-cyan" />
                <StatBox label="ADR" value={adr} color="text-warning" />
                <StatBox label="Win%" value={`${winRate}%`} color="text-success" />
              </div>

              {/* Detailed Stats */}
              <div className="pt-2 border-t border-border space-y-1.5">
                <StatRow label="Maç" value={stats.matches.toString()} />
                <StatRow label="K/D/A" value={`${stats.kills}/${stats.deaths}/${stats.assists}`} />
                <StatRow label="Toplam Hasar" value={stats.damage.toLocaleString()} />
                <StatRow label="Headshot" value={stats.headshots.toString()} />
              </div>
            </div>
          )}
        </div>

        {/* Close */}
        <div className="px-4 pb-3">
          <button onClick={onClose} className="w-full h-8 rounded text-xs font-medium text-secondary border border-border hover:bg-card-hover transition-colors">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-card rounded-md p-2.5 text-center">
      <div className={`text-lg font-black ${color}`}>{value}</div>
      <div className="text-[10px] text-dim">{label}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-dim">{label}</span>
      <span className="text-primary font-medium">{value}</span>
    </div>
  );
}

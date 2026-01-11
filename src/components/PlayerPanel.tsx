import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { usePanelStore } from "../stores/panelStore";
import { useAssetsStore } from "../stores/assetsStore";
import { useI18n, SKIN_API_LOCALES } from "../lib/i18n";
import { WEAPON_NAMES, AGENT_COLORS, RANK_TIERS } from "../lib/constants";

interface WeaponSkin {
  weapon_id: string;
  skin_id: string;
  chroma_id: string | null;
}
interface PlayerSkinData {
  puuid: string;
  skins: WeaponSkin[];
}
interface SkinInfo {
  name: string;
  icon: string;
}

const PRIORITY_WEAPONS = [
  "9c82e19d-4575-0200-1a81-3eacf00cf872", // Vandal
  "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a", // Phantom
  "a03b24d3-4319-996d-0f8c-94bbfba1dfc7", // Operator
  "e336c6b8-418d-9340-d77f-7a9e4cfe0702", // Sheriff
  "1baa85b4-4c70-1284-64bb-6481dfc3bb4e", // Ghost
  "462080d1-4035-2937-7c09-27aa2a5c27a7", // Spectre
];

const skinMetaCache = new Map<string, Map<string, SkinInfo>>();

export function PlayerPanel() {
  const { selectedPlayer, setHoveredWeapon } = usePanelStore();
  const { getAgentIcon } = useAssetsStore();
  const { t, locale } = useI18n();
  const [skins, setSkins] = useState<WeaponSkin[]>([]);
  const [skinMeta, setSkinMeta] = useState<Map<string, SkinInfo>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedPlayer) {
      fetchedRef.current = null;
      return;
    }
    const cacheKey = `${selectedPlayer.puuid}-${locale}`;
    if (fetchedRef.current === cacheKey) return;
    fetchLoadout();
  }, [selectedPlayer?.puuid, locale]);

  const fetchLoadout = async () => {
    if (!selectedPlayer) return;
    fetchedRef.current = `${selectedPlayer.puuid}-${locale}`;
    setLoading(true);
    setError(null);
    try {
      const data = await invoke<PlayerSkinData | null>("get_player_loadout", { puuid: selectedPlayer.puuid });
      if (!data) {
        setError(t("player.loadoutNotFound"));
        setLoading(false);
        return;
      }
      setSkins(data.skins);
      const apiLocale = SKIN_API_LOCALES[locale];
      if (!skinMetaCache.has(apiLocale)) skinMetaCache.set(apiLocale, new Map());
      const localeCache = skinMetaCache.get(apiLocale)!;
      const uncachedIds = data.skins.map((s) => s.chroma_id || s.skin_id).filter((id) => !localeCache.has(id));
      if (uncachedIds.length > 0) await fetchSkinMeta(uncachedIds, apiLocale, localeCache);
      const meta = new Map<string, SkinInfo>();
      data.skins.forEach((s) => {
        const id = s.chroma_id || s.skin_id;
        const c = localeCache.get(id);
        if (c) meta.set(id, c);
      });
      setSkinMeta(meta);
    } catch {
      setError(t("player.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchSkinMeta = async (skinIds: string[], apiLocale: string, cache: Map<string, SkinInfo>) => {
    try {
      const res = await fetch(`https://valorant-api.com/v1/weapons/skins?language=${apiLocale}`);
      if (!res.ok) return;
      const json = await res.json();
      for (const skin of json.data || []) {
        if (skinIds.includes(skin.uuid)) cache.set(skin.uuid, { name: skin.displayName || "Unknown", icon: skin.displayIcon || skin.chromas?.[0]?.displayIcon || "" });
        for (const chroma of skin.chromas || []) {
          if (skinIds.includes(chroma.uuid)) cache.set(chroma.uuid, { name: chroma.displayName || skin.displayName || "Unknown", icon: chroma.displayIcon || chroma.fullRender || skin.displayIcon || "" });
        }
      }
    } catch {}
  };

  const copyName = () => {
    if (selectedPlayer) {
      navigator.clipboard.writeText(selectedPlayer.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (!selectedPlayer) return null;

  const agentIcon = selectedPlayer.agent ? getAgentIcon(selectedPlayer.agent) : null;
  const agentColor = AGENT_COLORS[selectedPlayer.agent?.toLowerCase()] || "#768079";
  const [rankName, rankColor] = RANK_TIERS[selectedPlayer.rank_tier] || ["", "#768079"];

  const sortedSkins = [...skins]
    .filter((s) => WEAPON_NAMES[s.weapon_id])
    .sort((a, b) => {
      const aIdx = PRIORITY_WEAPONS.indexOf(a.weapon_id);
      const bIdx = PRIORITY_WEAPONS.indexOf(b.weapon_id);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return 0;
    });

  const handleWeaponHover = (skin: (typeof skins)[0] | null) => {
    if (!skin) {
      setHoveredWeapon(null);
      return;
    }
    const id = skin.chroma_id || skin.skin_id;
    const meta = skinMeta.get(id);
    const weaponType = WEAPON_NAMES[skin.weapon_id] || "?";
    if (meta) {
      setHoveredWeapon({ name: meta.name, icon: meta.icon, weaponType });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Player Header */}
      <div className="p-3 border-b border-border bg-linear-to-b from-[#0d1117] to-transparent">
        <div className="flex items-center gap-3">
          {agentIcon ? <img src={agentIcon} alt="" className="w-12 h-12 rounded-full object-cover" style={{ boxShadow: `0 0 16px ${agentColor}40`, border: `2px solid ${agentColor}` }} /> : <div className="w-12 h-12 rounded-full bg-card border border-border" />}
          <div className="flex-1 min-w-0">
            <button onClick={copyName} className="text-sm font-bold text-primary hover:text-accent-cyan transition-colors truncate block w-full text-left">
              {selectedPlayer.name}
            </button>
            {copied && <span className="text-[9px] text-success">{t("player.copied")}</span>}
            <div className="flex items-center gap-2 mt-0.5">
              {selectedPlayer.agent && (
                <span className="text-[10px] font-semibold" style={{ color: agentColor }}>
                  {selectedPlayer.agent.charAt(0).toUpperCase() + selectedPlayer.agent.slice(1)}
                </span>
              )}
              {selectedPlayer.rank_tier > 0 && (
                <span className="text-[10px] font-medium" style={{ color: rankColor }}>
                  {rankName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skins List */}
      <div className="flex-1 overflow-y-auto p-2" onMouseLeave={() => setHoveredWeapon(null)}>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && <div className="text-center py-6 text-error text-[11px]">{error}</div>}
        {!loading && !error && sortedSkins.length > 0 && (
          <div className="divide-y divide-border/30">
            {sortedSkins.map((skin) => {
              const id = skin.chroma_id || skin.skin_id;
              const meta = skinMeta.get(id);
              const weaponName = WEAPON_NAMES[skin.weapon_id] || "?";
              const isPriority = PRIORITY_WEAPONS.includes(skin.weapon_id);
              return (
                <div key={skin.weapon_id} className={`flex items-center gap-2 p-2 transition-all cursor-pointer ${isPriority ? "bg-accent-cyan/5 hover:bg-accent-cyan/15" : "hover:bg-card/80"}`} onMouseEnter={() => handleWeaponHover(skin)}>
                  <div className="w-16 h-10 flex items-center justify-center shrink-0">{meta?.icon && <img src={meta.icon} alt="" className="max-w-full max-h-full object-contain drop-shadow-lg" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-dim uppercase tracking-wide">{weaponName}</div>
                    <div className="text-[10px] text-primary font-medium truncate">{meta?.name || "—"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && !error && sortedSkins.length === 0 && <div className="text-center py-6 text-dim text-[11px]">{t("player.noSkinData")}</div>}
      </div>
    </div>
  );
}

export interface ConnectionStatus {
  connected: boolean;
  region: string;
  message: string;
}

export interface PlayerData {
  puuid: string;
  name: string;
  agent: string;
  locked: boolean;
  party: string;
  is_me: boolean;
  rank_tier: number;
  rank_rr: number;
  level: number;
}

export interface GameState {
  state: "idle" | "pregame" | "ingame" | "disconnected";
  match_id: string | null;
  map_name: string | null;
  mode_name: string | null;
  side: string | null;
  allies: PlayerData[];
  enemies: PlayerData[];
}

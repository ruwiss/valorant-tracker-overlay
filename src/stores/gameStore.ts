import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { ConnectionStatus, GameState } from "../lib/types";

interface GameStore {
  connected: boolean;
  region: string;
  gameState: GameState;
  autoLockAgent: string | null;
  consecutiveErrors: number;
  henrikApiKey: string;

  initialize: () => Promise<void>;
  fetchGameState: () => Promise<void>;
  reconnect: () => Promise<void>;
  setAutoLock: (agent: string | null) => void;
  setHenrikApiKey: (key: string) => void;
}

const initialGameState: GameState = {
  state: "idle",
  match_id: null,
  map_name: null,
  mode_name: null,
  side: null,
  allies: [],
  enemies: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  connected: false,
  region: "",
  gameState: initialGameState,
  autoLockAgent: null,
  consecutiveErrors: 0,
  henrikApiKey: localStorage.getItem("henrikApiKey") || "",

  initialize: async () => {
    try {
      const status = await invoke<ConnectionStatus>("initialize");
      set({ connected: status.connected, region: status.region, consecutiveErrors: 0 });
    } catch {
      set({ connected: false });
      setTimeout(() => get().initialize(), 5000);
    }
  },

  reconnect: async () => {
    set({ connected: false, gameState: initialGameState });
    await get().initialize();
    if (get().connected) {
      await get().fetchGameState();
    }
  },

  fetchGameState: async () => {
    try {
      const state = await invoke<GameState>("get_game_state");

      // Check if disconnected state returned
      if (state.state === "disconnected") {
        const errors = get().consecutiveErrors + 1;
        set({ consecutiveErrors: errors });

        // After 3 consecutive disconnected states, try to reconnect
        if (errors >= 3) {
          console.log("Connection lost, attempting reconnect...");
          await get().reconnect();
        }
        return;
      }

      // Success - reset error counter
      set({ gameState: state, consecutiveErrors: 0, connected: true });
    } catch {
      const errors = get().consecutiveErrors + 1;
      set({ consecutiveErrors: errors });

      // After 3 consecutive errors, try to reconnect
      if (errors >= 3) {
        console.log("API errors, attempting reconnect...");
        await get().reconnect();
      }
    }
  },

  setAutoLock: (agent) => {
    set({ autoLockAgent: agent });
    invoke("set_auto_lock", { agent });
  },

  setHenrikApiKey: (key) => {
    localStorage.setItem("henrikApiKey", key);
    set({ henrikApiKey: key });
  },
}));

import { create } from "zustand";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import type { PlayerData } from "../lib/types";

type PanelType = "settings" | "player" | null;

const BASE_WIDTH = 380;
const PANEL_WIDTH = 260;
const WINDOW_HEIGHT = 800;

export interface HoveredWeapon {
  name: string;
  icon: string;
  weaponType: string;
}

interface PanelStore {
  isOpen: boolean;
  panelType: PanelType;
  selectedPlayer: PlayerData | null;
  hoveredWeapon: HoveredWeapon | null;

  openSettings: () => Promise<void>;
  openPlayer: (player: PlayerData) => Promise<void>;
  close: () => Promise<void>;
  setHoveredWeapon: (weapon: HoveredWeapon | null) => void;
}

async function resizeWindow(expanded: boolean) {
  try {
    const win = getCurrentWindow();
    const width = expanded ? BASE_WIDTH + PANEL_WIDTH : BASE_WIDTH;
    await win.setSize(new LogicalSize(width, WINDOW_HEIGHT));
  } catch (error) {
    console.error("Failed to resize window:", error);
  }
}

export const usePanelStore = create<PanelStore>((set, get) => ({
  isOpen: false,
  panelType: null,
  selectedPlayer: null,
  hoveredWeapon: null,

  openSettings: async () => {
    const wasOpen = get().isOpen;
    set({ isOpen: true, panelType: "settings", selectedPlayer: null, hoveredWeapon: null });
    if (!wasOpen) {
      await resizeWindow(true);
    }
  },

  openPlayer: async (player) => {
    const wasOpen = get().isOpen;
    set({ isOpen: true, panelType: "player", selectedPlayer: player, hoveredWeapon: null });
    if (!wasOpen) {
      await resizeWindow(true);
    }
  },

  close: async () => {
    set({ isOpen: false, panelType: null, selectedPlayer: null, hoveredWeapon: null });
    await resizeWindow(false);
  },

  setHoveredWeapon: (weapon) => {
    set({ hoveredWeapon: weapon });
  },
}));

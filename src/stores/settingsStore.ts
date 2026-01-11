import { create } from "zustand";
import { persist } from "zustand/middleware";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";

interface WindowPosition {
  x: number;
  y: number;
}

interface SettingsStore {
  hotkey: string;
  windowPosition: WindowPosition | null;
  isHotkeyPaused: boolean;
  setHotkey: (key: string) => Promise<boolean>;
  setWindowPosition: (pos: WindowPosition) => void;
  registerHotkey: () => Promise<void>;
  pauseHotkey: () => Promise<void>;
  resumeHotkey: () => Promise<void>;
  restoreWindowPosition: () => Promise<void>;
  saveCurrentPosition: () => Promise<void>;
}

let isToggling = false;

const toggleWindow = async () => {
  if (isToggling) return;
  isToggling = true;

  const win = getCurrentWindow();
  const visible = await win.isVisible();

  if (visible) {
    await win.hide();
  } else {
    await win.show();
    await win.setFocus();
  }

  setTimeout(() => {
    isToggling = false;
  }, 300);
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      hotkey: "F2",
      windowPosition: null,
      isHotkeyPaused: false,

      setHotkey: async (newKey: string) => {
        const currentKey = get().hotkey;

        // If same key, just resume
        if (newKey === currentKey) {
          await get().resumeHotkey();
          return true;
        }

        try {
          // Register new hotkey
          await register(newKey, toggleWindow);
          set({ hotkey: newKey, isHotkeyPaused: false });
          return true;
        } catch (error) {
          console.error("Failed to register hotkey:", error);
          // Restore old hotkey
          await register(currentKey, toggleWindow).catch(() => {});
          set({ isHotkeyPaused: false });
          return false;
        }
      },

      setWindowPosition: (pos: WindowPosition) => {
        set({ windowPosition: pos });
      },

      registerHotkey: async () => {
        const { hotkey } = get();
        try {
          await register(hotkey, toggleWindow);
        } catch (error) {
          console.error("Failed to register hotkey:", error);
        }
      },

      pauseHotkey: async () => {
        const { hotkey, isHotkeyPaused } = get();
        if (isHotkeyPaused) return;

        try {
          await unregister(hotkey);
          set({ isHotkeyPaused: true });
        } catch (error) {
          console.error("Failed to pause hotkey:", error);
        }
      },

      resumeHotkey: async () => {
        const { hotkey, isHotkeyPaused } = get();
        if (!isHotkeyPaused) return;

        try {
          await register(hotkey, toggleWindow);
          set({ isHotkeyPaused: false });
        } catch (error) {
          console.error("Failed to resume hotkey:", error);
        }
      },

      restoreWindowPosition: async () => {
        const { windowPosition } = get();
        if (windowPosition) {
          try {
            const win = getCurrentWindow();
            await win.setPosition(new PhysicalPosition(windowPosition.x, windowPosition.y));
          } catch (error) {
            console.error("Failed to restore window position:", error);
          }
        }
      },

      saveCurrentPosition: async () => {
        try {
          const win = getCurrentWindow();
          const pos = await win.outerPosition();
          set({ windowPosition: { x: pos.x, y: pos.y } });
        } catch (error) {
          console.error("Failed to save window position:", error);
        }
      },
    }),
    {
      name: "valorant-tracker-settings",
      partialize: (state) => ({
        hotkey: state.hotkey,
        windowPosition: state.windowPosition,
      }),
    }
  )
);

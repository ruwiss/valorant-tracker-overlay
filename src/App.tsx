import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { WaitingState } from "./components/WaitingState";
import { PregameState } from "./components/PregameState";
import { IngameState } from "./components/IngameState";
import { SidePanel } from "./components/SidePanel";
import { WeaponOverlay } from "./components/WeaponOverlay";
import { useGameStore } from "./stores/gameStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useAssetsStore } from "./stores/assetsStore";

let shortcutRegistered = false;

function App() {
  const { initialize, fetchGameState, gameState } = useGameStore();
  const { registerHotkey, restoreWindowPosition, saveCurrentPosition } = useSettingsStore();
  const { loadAssets } = useAssetsStore();
  const positionInitialized = useRef(false);

  useEffect(() => {
    initialize();
    loadAssets();

    if (!shortcutRegistered) {
      shortcutRegistered = true;
      registerHotkey();
    }

    if (!positionInitialized.current) {
      positionInitialized.current = true;
      restoreWindowPosition();
    }

    let unlisten: (() => void) | null = null;
    const setupMoveListener = async () => {
      const win = getCurrentWindow();
      unlisten = await win.onMoved(() => {
        saveCurrentPosition();
      });
    };
    setupMoveListener();

    const interval = setInterval(fetchGameState, 3000);
    return () => {
      clearInterval(interval);
      if (unlisten) unlisten();
    };
  }, []);

  const renderContent = () => {
    switch (gameState.state) {
      case "pregame":
        return <PregameState />;
      case "ingame":
        return <IngameState />;
      default:
        return <WaitingState />;
    }
  };

  return (
    <div className="h-full flex bg-dark">
      {/* Main content */}
      <div className="relative flex-1 flex flex-col p-4 pl-5 min-w-0">
        <Header />
        {renderContent()}
        <Footer />

        {/* Weapon hover overlay */}
        <WeaponOverlay />
      </div>

      {/* Side panel */}
      <SidePanel />
    </div>
  );
}

export default App;

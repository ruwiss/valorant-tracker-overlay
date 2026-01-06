import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { register } from "@tauri-apps/plugin-global-shortcut";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { WaitingState } from "./components/WaitingState";
import { PregameState } from "./components/PregameState";
import { IngameState } from "./components/IngameState";
import { AgentLockModal } from "./components/SettingsModal";
import { ApiSettingsModal } from "./components/ApiSettingsModal";
import { useGameStore } from "./stores/gameStore";

let shortcutRegistered = false;
let isToggling = false;

function App() {
  const { initialize, fetchGameState, gameState } = useGameStore();
  const [agentLockOpen, setAgentLockOpen] = useState(false);
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);

  useEffect(() => {
    initialize();

    // F2 global shortcut
    if (!shortcutRegistered) {
      shortcutRegistered = true;
      register("F2", async () => {
        if (isToggling) return;
        isToggling = true;

        const win = getCurrentWindow();
        const visible = await win.isVisible();
        if (visible) {
          await win.hide();
        } else {
          await win.show();
        }

        setTimeout(() => {
          isToggling = false;
        }, 300);
      }).catch(console.error);
    }

    // Polling
    const interval = setInterval(fetchGameState, 3000);
    return () => clearInterval(interval);
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
    <div className="h-full flex flex-col bg-dark p-4 pl-5">
      <Header />
      {renderContent()}
      <Footer onOpenAgentLock={() => setAgentLockOpen(true)} onOpenApiSettings={() => setApiSettingsOpen(true)} />
      <AgentLockModal open={agentLockOpen} onClose={() => setAgentLockOpen(false)} />
      <ApiSettingsModal open={apiSettingsOpen} onClose={() => setApiSettingsOpen(false)} />
    </div>
  );
}

export default App;

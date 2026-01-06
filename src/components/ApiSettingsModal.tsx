import { useState } from "react";
import { open } from "@tauri-apps/plugin-shell";
import { useGameStore } from "../stores/gameStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ApiSettingsModal({ open: isOpen, onClose }: Props) {
  const { henrikApiKey, setHenrikApiKey } = useGameStore();
  const [apiKeyInput, setApiKeyInput] = useState(henrikApiKey);

  if (!isOpen) return null;

  const save = () => {
    setHenrikApiKey(apiKeyInput.trim());
    onClose();
  };

  const openKeyPage = () => {
    open("https://api.henrikdev.xyz/dashboard/api-keys");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-[320px] bg-dark rounded-lg border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-4 border-b border-border">
          <h2 className="text-sm font-black text-primary">API Ayarları</h2>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <div className="text-[11px] font-semibold text-dim mb-2">HenrikDev API Key</div>
            <input type="password" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} placeholder="HDEV-xxxxxxxx-xxxx-xxxx" className="w-full h-9 px-3 rounded bg-card border border-border text-xs text-primary placeholder:text-dim focus:outline-none focus:border-accent-cyan" />
          </div>
          <button onClick={openKeyPage} className="text-[10px] text-accent-cyan hover:underline">
            Ücretsiz key al →
          </button>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          <button onClick={onClose} className="flex-1 h-9 rounded text-xs font-medium text-secondary border border-border hover:bg-card-hover transition-colors">
            İptal
          </button>
          <button onClick={save} className="flex-1 h-9 rounded text-xs font-semibold bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 transition-colors">
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

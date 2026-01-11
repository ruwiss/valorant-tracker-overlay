import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "../stores/gameStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useAssetsStore } from "../stores/assetsStore";
import { useI18n } from "../lib/i18n";
import { AGENTS, AGENT_COLORS } from "../lib/constants";

const STANDALONE_KEYS = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "Insert", "Delete", "Home", "End", "PageUp", "PageDown", "Pause", "ScrollLock", "NumLock"];

const BLOCKED_KEYS = ["Escape", "Tab", "CapsLock", "Enter", "Backspace", "Space"];
const MODIFIERS = ["Control", "Alt", "Shift", "Meta"];

function buildHotkeyString(e: KeyboardEvent): string | null {
  const key = e.key;
  if (BLOCKED_KEYS.includes(key) || MODIFIERS.includes(key)) return null;
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");
  let normalizedKey = key;
  if (key.match(/^F\d{1,2}$/i)) normalizedKey = key.toUpperCase();
  else if (key.length === 1 && key.match(/[a-zA-Z]/)) normalizedKey = key.toUpperCase();
  if (parts.length === 0) {
    if (STANDALONE_KEYS.includes(normalizedKey)) return normalizedKey;
    if (normalizedKey.length === 1 && normalizedKey.match(/[A-Z0-9]/)) return normalizedKey;
    return null;
  }
  parts.push(normalizedKey);
  return parts.join("+");
}

export function SettingsPanel() {
  const { autoLockAgent, setAutoLock } = useGameStore();
  const { hotkey, setHotkey, pauseHotkey, resumeHotkey } = useSettingsStore();
  const { getAgentIcon } = useAssetsStore();
  const { locale, setLocale, t } = useI18n();
  const [recording, setRecording] = useState(false);
  const [recordingDisplay, setRecordingDisplay] = useState("");
  const [hotkeyError, setHotkeyError] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    await pauseHotkey();
    setRecording(true);
    setRecordingDisplay("");
    setHotkeyError(null);
  }, [pauseHotkey]);

  const cancelRecording = useCallback(async () => {
    setRecording(false);
    setRecordingDisplay("");
    await resumeHotkey();
  }, [resumeHotkey]);

  const handleHotkeyRecord = useCallback(
    async (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") {
        cancelRecording();
        return;
      }
      const modParts: string[] = [];
      if (e.ctrlKey) modParts.push("Ctrl");
      if (e.altKey) modParts.push("Alt");
      if (e.shiftKey) modParts.push("Shift");
      if (MODIFIERS.includes(e.key)) {
        setRecordingDisplay(modParts.length > 0 ? modParts.join("+") + "+" : "");
        return;
      }
      const hotkeyString = buildHotkeyString(e);
      if (!hotkeyString) {
        setHotkeyError(locale === "tr" ? "Geçersiz tuş" : "Invalid key");
        setTimeout(() => setHotkeyError(null), 2000);
        return;
      }
      setRecording(false);
      setRecordingDisplay("");
      const success = await setHotkey(hotkeyString);
      if (!success) {
        setHotkeyError(locale === "tr" ? "Kayıt başarısız" : "Failed");
        setTimeout(() => setHotkeyError(null), 2000);
      }
    },
    [setHotkey, locale, cancelRecording]
  );

  useEffect(() => {
    if (recording) {
      window.addEventListener("keydown", handleHotkeyRecord);
      return () => window.removeEventListener("keydown", handleHotkeyRecord);
    }
  }, [recording, handleHotkeyRecord]);

  return (
    <div className="flex flex-col h-full">
      {/* Top Settings: Language & Hotkey */}
      <div className="p-3 space-y-3 border-b border-border/50">
        {/* Language */}
        <div>
          <label className="text-[10px] text-dim block mb-1.5">{t("settings.language")}</label>
          <div className="flex gap-1.5">
            <button onClick={() => setLocale("en")} className={`flex-1 h-7 rounded text-[10px] font-semibold border transition-all ${locale === "en" ? "bg-accent-cyan/15 border-accent-cyan text-accent-cyan" : "border-border text-secondary hover:bg-card-hover"}`}>
              EN
            </button>
            <button onClick={() => setLocale("tr")} className={`flex-1 h-7 rounded text-[10px] font-semibold border transition-all ${locale === "tr" ? "bg-accent-cyan/15 border-accent-cyan text-accent-cyan" : "border-border text-secondary hover:bg-card-hover"}`}>
              TR
            </button>
          </div>
        </div>
        {/* Hotkey */}
        <div>
          <label className="text-[10px] text-dim block mb-1.5">{t("settings.hotkey")}</label>
          {recording ? (
            <div className="flex gap-1.5">
              <div className="flex-1 h-8 rounded text-[11px] font-bold border bg-accent-cyan/20 border-accent-cyan text-accent-cyan animate-pulse flex items-center justify-center">{recordingDisplay || "..."}</div>
              <button onClick={cancelRecording} className="px-3 h-8 rounded text-[10px] font-semibold border border-error/50 text-error hover:bg-error/10 transition-all">
                {locale === "tr" ? "İptal" : "Cancel"}
              </button>
            </div>
          ) : (
            <button onClick={startRecording} className="w-full h-8 rounded text-[11px] font-bold border bg-card border-border text-primary hover:bg-card-hover transition-all">
              {hotkey}
            </button>
          )}
          {hotkeyError && <p className="text-[9px] text-error mt-1">{hotkeyError}</p>}
        </div>
      </div>

      {/* Agent Selection - Full remaining height */}
      <div className="flex-1 flex flex-col min-h-0 p-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] text-dim">{t("settings.autoLockAgent")}</label>
          {autoLockAgent && (
            <button onClick={() => setAutoLock(null)} className="text-[9px] text-dim hover:text-error transition-colors">
              ✕ {locale === "tr" ? "Temizle" : "Clear"}
            </button>
          )}
        </div>
        {autoLockAgent && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-success/10 border border-success/30 rounded">
            <img src={getAgentIcon(autoLockAgent) || ""} alt="" className="w-5 h-5 rounded-full" />
            <span className="text-[10px] font-bold text-success">{autoLockAgent.charAt(0).toUpperCase() + autoLockAgent.slice(1)}</span>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-1.5">
            {AGENTS.map((agent) => {
              const isSelected = autoLockAgent === agent;
              const color = AGENT_COLORS[agent] || "#768079";
              const icon = getAgentIcon(agent);
              return (
                <button key={agent} onClick={() => setAutoLock(agent)} className={`flex items-center gap-2 p-2 rounded border transition-all ${isSelected ? "bg-card-hover border-accent-cyan" : "bg-card/30 border-transparent hover:bg-card-hover hover:border-border"}`}>
                  {icon ? <img src={icon} alt="" className="w-7 h-7 rounded-full" style={{ border: isSelected ? `2px solid ${color}` : "2px solid transparent" }} /> : <div className="w-7 h-7 rounded-full" style={{ backgroundColor: color + "40" }} />}
                  <span className="text-[11px] font-semibold truncate" style={{ color: isSelected ? color : "#ece8e1" }}>
                    {agent.charAt(0).toUpperCase() + agent.slice(1)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className="p-2 border-t border-border">
        <p className="text-[9px] text-dim text-center">
          {t("settings.madeBy")}{" "}
          <a
            href="https://github.com/ruwiss/"
            className="text-accent-cyan hover:underline font-semibold"
            onClick={(e) => {
              e.preventDefault();
              import("@tauri-apps/plugin-opener").then(({ openUrl }) => openUrl("https://github.com/ruwiss/"));
            }}
          >
            @ruwiss
          </a>
        </p>
      </div>
    </div>
  );
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "tr";

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Header
    "header.overlay": "F2 Overlay",
    "header.connected": "Connected",
    "header.connecting": "Connecting...",
    "header.reconnect": "Reconnect",
    "header.close": "Close",

    // Footer
    "footer.autoLock": "AUTO-LOCK",
    "footer.off": "OFF",
    "footer.agentLock": "Agent Lock",

    // Waiting State
    "waiting.title": "Waiting for Match",
    "waiting.desc": "Start a match to see player data",

    // Pregame
    "pregame.allies": "ALLIES",
    "pregame.enemies": "ENEMIES",
    "pregame.selecting": "Selecting...",

    // Ingame
    "ingame.allies": "ALLIES",
    "ingame.enemies": "ENEMIES",

    // Player Card
    "player.level": "Lvl",
    "player.copied": "Copied!",
    "player.weaponSkins": "Weapon Skins",
    "player.loadoutNotFound": "Loadout not found",
    "player.connectionError": "Connection error",
    "player.noSkinData": "No skin data",
    "player.copy": "Copy",
    "player.close": "Close",

    // Settings Modal
    "settings.title": "Settings",
    "settings.autoLockAgent": "Auto-Lock Agent",
    "settings.autoLockDesc": "Agent to auto-lock when match starts",
    "settings.disableAutoLock": "Disable Auto-Lock",
    "settings.language": "Language",
    "settings.hotkey": "Toggle Hotkey",
    "settings.hotkeyDesc": "Press any key to set new hotkey",
    "settings.hotkeyRecording": "Press a key...",
    "settings.madeBy": "Made by",
    "settings.close": "Close",
  },
  tr: {
    // Header
    "header.overlay": "F2 Overlay",
    "header.connected": "Bağlandı",
    "header.connecting": "Bağlanıyor...",
    "header.reconnect": "Yeniden Bağlan",
    "header.close": "Kapat",

    // Footer
    "footer.autoLock": "OTO-KİLİT",
    "footer.off": "KAPALI",
    "footer.agentLock": "Ajan Kilitleme",

    // Waiting State
    "waiting.title": "Maç Bekleniyor",
    "waiting.desc": "Oyuncu verilerini görmek için maç başlatın",

    // Pregame
    "pregame.allies": "TAKIMIM",
    "pregame.enemies": "DÜŞMANLAR",
    "pregame.selecting": "Seçiliyor...",

    // Ingame
    "ingame.allies": "TAKIMIM",
    "ingame.enemies": "DÜŞMANLAR",

    // Player Card
    "player.level": "Svye",
    "player.copied": "Kopyalandı!",
    "player.weaponSkins": "Silah Skinleri",
    "player.loadoutNotFound": "Loadout bulunamadı",
    "player.connectionError": "Bağlantı hatası",
    "player.noSkinData": "Skin verisi yok",
    "player.copy": "Kopyala",
    "player.close": "Kapat",

    // Settings Modal
    "settings.title": "Ayarlar",
    "settings.autoLockAgent": "Otomatik Ajan Kilidi",
    "settings.autoLockDesc": "Maç başladığında otomatik kilitlenecek ajan",
    "settings.disableAutoLock": "Auto-Lock Kapat",
    "settings.language": "Dil",
    "settings.hotkey": "Açma/Kapama Tuşu",
    "settings.hotkeyDesc": "Yeni tuş atamak için bir tuşa basın",
    "settings.hotkeyRecording": "Bir tuşa basın...",
    "settings.madeBy": "Yapımcı",
    "settings.close": "Kapat",
  },
};

// Weapon skin names by locale (for valorant-api.com)
export const SKIN_API_LOCALES: Record<Locale, string> = {
  en: "en-US",
  tr: "tr-TR",
};

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      locale: "en" as Locale,
      setLocale: (locale: Locale) => set({ locale }),
      t: (key: string) => {
        const { locale } = get();
        return translations[locale][key] || translations.en[key] || key;
      },
    }),
    {
      name: "valorant-tracker-locale",
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);

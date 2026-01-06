# Valorant Tracker

Valorant oyun içi overlay uygulaması. Takım arkadaşlarınızı ve rakiplerinizi anlık olarak takip edin.

## Özellikler

- F2 ile açılıp kapanan overlay
- Ajan seçimi ekranında takım bilgileri
- Oyun içinde takım ve düşman bilgileri
- Parti tespiti
- Otomatik ajan kilitleme
- Oyuncu istatistikleri (HenrikDev API)

## Teknolojiler

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Tauri v2 + Rust
- **State:** Zustand

## Kurulum

1. [Releases](../../releases) sayfasından son sürümü indirin
2. MSI dosyasını çalıştırın
3. Valorant'ı açın
4. F2 ile overlay'i açıp kapatın

## Geliştirme

```bash
cd valorant-tracker
pnpm install
pnpm tauri dev
```

## Build

```bash
pnpm tauri build
```

mod api;
mod commands;
mod constants;
mod state;

use state::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::initialize,
            commands::get_game_state,
            commands::set_auto_lock,
            commands::get_auto_lock,
            commands::get_player_loadout,
        ])
        .setup(|app| {
            // Window starts hidden, F2 toggles visibility
            let window = app.get_webview_window("main").unwrap();

            #[cfg(debug_assertions)]
            window.open_devtools();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use crate::api::types::*;
use crate::constants::{AGENTS, MAP_NAMES, QUEUE_NAMES};
use crate::state::AppState;
use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub async fn initialize(state: State<'_, AppState>) -> Result<ConnectionStatus, String> {
    state.api.initialize().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_game_state(state: State<'_, AppState>) -> Result<GameState, String> {
    let api = &state.api;

    if !*api.connected.read() {
        return Ok(GameState {
            state: "disconnected".into(),
            match_id: None,
            map_name: None,
            mode_name: None,
            side: None,
            allies: vec![],
            enemies: vec![],
        });
    }

    // Check pregame
    if let Some(match_id) = api.get_pregame_match_id().await {
        if let Some(match_data) = api.get_pregame_match(&match_id).await {
            let map_name = MAP_NAMES.get(match_data.map_id.as_str())
                .map(|s| s.to_string())
                .unwrap_or_else(|| "Unknown".into());
            let mode_name = QUEUE_NAMES.get(match_data.queue_id.as_str())
                .map(|s| s.to_string())
                .unwrap_or_else(|| match_data.queue_id.clone());

            let mut allies = vec![];
            let my_puuid = api.puuid.read().clone();

            if let Some(team) = match_data.ally_team {
                let side = if team.team_id == "Red" { "SALDIRAN" } else { "SAVUNAN" };
                let puuids: Vec<String> = team.players.iter().map(|p| p.subject.clone()).collect();
                let names = api.get_player_names(&puuids).await;

                // Get parties with caching - only fetch once per match
                let parties = get_cached_parties(&state, &match_id, &puuids, api).await;

                // Check if I'm already locked
                let my_player = team.players.iter().find(|p| p.subject == my_puuid);
                let im_locked = my_player.map(|p| p.character_selection_state == "locked").unwrap_or(false);

                // Auto-lock: keep trying until locked
                if !im_locked {
                    let auto_lock_agent = state.auto_lock_agent.read().clone();
                    if let Some(agent_name) = auto_lock_agent.as_ref() {
                        if let Some(agent_id) = AGENTS.get(agent_name.to_lowercase().as_str()) {
                            api.select_agent(&match_id, agent_id).await;
                            tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
                            api.lock_agent(&match_id, agent_id).await;
                        }
                    }
                }

                for p in team.players {
                    let agent_name = get_agent_name(&p.character_id);
                    let level = p.player_identity.map(|i| i.account_level).unwrap_or(0);
                    let party = parties.get(&p.subject).cloned().unwrap_or_else(|| "Solo".into());

                    allies.push(PlayerData {
                        puuid: p.subject.clone(),
                        name: names.get(&p.subject).cloned().unwrap_or_else(|| "Unknown".into()),
                        agent: agent_name,
                        locked: p.character_selection_state == "locked",
                        party,
                        is_me: p.subject == my_puuid,
                        rank_tier: p.competitive_tier,
                        rank_rr: 0,
                        level,
                    });
                }

                return Ok(GameState {
                    state: "pregame".into(),
                    match_id: Some(match_id),
                    map_name: Some(map_name),
                    mode_name: Some(mode_name),
                    side: Some(side.into()),
                    allies,
                    enemies: vec![],
                });
            }
        }
    }

    // Check coregame
    if let Some(match_id) = api.get_coregame_match_id().await {
        if let Some(match_data) = api.get_coregame_match(&match_id).await {
            let map_name = MAP_NAMES.get(match_data.map_id.as_str())
                .map(|s| s.to_string())
                .unwrap_or_else(|| "Unknown".into());

            let my_puuid = api.puuid.read().clone();
            let puuids: Vec<String> = match_data.players.iter().map(|p| p.subject.clone()).collect();
            let names = api.get_player_names(&puuids).await;

            // Get parties with caching
            let parties = get_cached_parties(&state, &match_id, &puuids, api).await;

            let my_team = match_data.players.iter()
                .find(|p| p.subject == my_puuid)
                .map(|p| p.team_id.clone())
                .unwrap_or_default();

            let mut allies = vec![];
            let mut enemies = vec![];

            for p in match_data.players {
                let agent_name = get_agent_name(&p.character_id);
                let level = p.player_identity.map(|i| i.account_level).unwrap_or(0);
                let rank = p.seasonal_badge_info.and_then(|s| s.rank).unwrap_or(0);
                let party = parties.get(&p.subject).cloned().unwrap_or_else(|| "Solo".into());

                let player = PlayerData {
                    puuid: p.subject.clone(),
                    name: names.get(&p.subject).cloned().unwrap_or_else(|| "Unknown".into()),
                    agent: agent_name,
                    locked: true,
                    party,
                    is_me: p.subject == my_puuid,
                    rank_tier: rank,
                    rank_rr: 0,
                    level,
                };

                if p.team_id == my_team {
                    allies.push(player);
                } else {
                    enemies.push(player);
                }
            }

            return Ok(GameState {
                state: "ingame".into(),
                match_id: Some(match_id),
                map_name: Some(map_name),
                mode_name: None,
                side: None,
                allies,
                enemies,
            });
        }
    }

    // Clear party cache when idle (no match) - only if we were in a game session
    {
        let was_in_game = *state.in_game_session.read();
        if was_in_game {
            // Returning to lobby - clear all caches for next game
            state.cached_parties.write().clear();
            state.fetched_history_players.write().clear();
            *state.in_game_session.write() = false;
        }
    }

    Ok(GameState {
        state: "idle".into(),
        match_id: None,
        map_name: None,
        mode_name: None,
        side: None,
        allies: vec![],
        enemies: vec![],
    })
}

/// Get parties with caching - persists across pregame->ingame transition
/// Only clears when returning to idle state (lobby)
async fn get_cached_parties(
    state: &State<'_, AppState>,
    _match_id: &str,
    puuids: &[String],
    api: &crate::api::ValorantAPI,
) -> HashMap<String, String> {
    // Mark that we're in a game session
    *state.in_game_session.write() = true;

    // Get existing cached parties
    let cached = state.cached_parties.read().clone();

    // Check if all players are already cached
    let all_cached = puuids.iter().all(|p| cached.contains_key(p));
    if all_cached {
        return cached;
    }

    // Determine which players need history fetch (not fetched before this game session)
    let players_needing_fetch: Vec<String> = {
        let fetched = state.fetched_history_players.read();
        puuids.iter()
            .filter(|p| !fetched.contains(*p))
            .cloned()
            .collect()
    };

    // If no new players to fetch, return existing cache + mark missing as Solo
    if players_needing_fetch.is_empty() {
        let mut result = cached;
        for puuid in puuids {
            if !result.contains_key(puuid) {
                result.insert(puuid.clone(), "Solo".into());
            }
        }
        return result;
    }

    // Fetch parties - pass ALL puuids but only fetch history for new players
    // This ensures consistent party numbering across the entire lobby
    let new_parties = api.detect_parties_with_cache(puuids, &players_needing_fetch, &cached).await;

    // Mark these players as fetched
    {
        let mut fetched = state.fetched_history_players.write();
        for p in &players_needing_fetch {
            fetched.insert(p.clone());
        }
    }

    // Update party cache with merged result
    *state.cached_parties.write() = new_parties.clone();

    new_parties
}

#[tauri::command]
pub fn set_auto_lock(state: State<'_, AppState>, agent: Option<String>) {
    *state.auto_lock_agent.write() = agent;
}

#[tauri::command]
pub fn get_auto_lock(state: State<'_, AppState>) -> Option<String> {
    state.auto_lock_agent.read().clone()
}

fn get_agent_name(agent_id: &str) -> String {
    for (name, id) in AGENTS.iter() {
        if id.eq_ignore_ascii_case(agent_id) {
            return name.to_string();
        }
    }
    String::new()
}

#[tauri::command]
pub async fn get_player_loadout(
    state: State<'_, AppState>,
    puuid: String,
) -> Result<Option<crate::api::types::PlayerSkinData>, String> {
    let api = &state.api;

    if !*api.connected.read() {
        return Err("Not connected".into());
    }

    // Check cache first
    {
        let cached = state.cached_loadouts.read();
        if let Some(loadout) = cached.get(&puuid) {
            return Ok(Some(loadout.clone()));
        }
    }

    // Try to get match id - first check coregame, then pregame
    let (match_id, is_pregame) = if let Some(id) = api.get_coregame_match_id().await {
        (id, false)
    } else if let Some(id) = api.get_pregame_match_id().await {
        (id, true)
    } else {
        return Err("Not in game".into());
    };

    // Check if match changed - clear cache
    {
        let cached_match = state.loadouts_match_id.read();
        if cached_match.as_ref() != Some(&match_id) {
            drop(cached_match);
            state.cached_loadouts.write().clear();
            *state.loadouts_match_id.write() = Some(match_id.clone());
        }
    }

    // Fetch loadouts based on game state
    if is_pregame {
        // Pregame loadouts
        if let Some(loadouts_response) = api.get_pregame_loadouts(&match_id).await {
            let mut cache = state.cached_loadouts.write();

            for loadout_data in loadouts_response.loadouts {
                let player_puuid = loadout_data.subject.clone();
                let mut skins = Vec::new();

                for (weapon_id, item) in loadout_data.items {
                    let mut chroma_id = None;

                    if let Some(sockets) = &item.sockets {
                        for (_socket_id, socket_item) in sockets {
                            if socket_item.item.type_id == "3ad1b2b2-acdb-4524-852f-954a76ddae0a" {
                                chroma_id = Some(socket_item.item.id.clone());
                            }
                        }
                    }

                    skins.push(crate::api::types::WeaponSkin {
                        weapon_id,
                        skin_id: item.id,
                        chroma_id,
                    });
                }

                cache.insert(
                    player_puuid.clone(),
                    crate::api::types::PlayerSkinData {
                        puuid: player_puuid,
                        skins,
                    },
                );
            }

            return Ok(cache.get(&puuid).cloned());
        }
    } else {
        // Coregame loadouts
        if let Some(loadouts_response) = api.get_coregame_loadouts(&match_id).await {
            let mut cache = state.cached_loadouts.write();

            for player_loadout in loadouts_response.loadouts {
                let player_puuid = player_loadout.loadout.subject.clone();
                let mut skins = Vec::new();

                for (weapon_id, item) in player_loadout.loadout.items {
                    let mut chroma_id = None;

                    if let Some(sockets) = &item.sockets {
                        for (_socket_id, socket_item) in sockets {
                            if socket_item.item.type_id == "3ad1b2b2-acdb-4524-852f-954a76ddae0a" {
                                chroma_id = Some(socket_item.item.id.clone());
                            }
                        }
                    }

                    skins.push(crate::api::types::WeaponSkin {
                        weapon_id,
                        skin_id: item.id,
                        chroma_id,
                    });
                }

                cache.insert(
                    player_puuid.clone(),
                    crate::api::types::PlayerSkinData {
                        puuid: player_puuid,
                        skins,
                    },
                );
            }

            return Ok(cache.get(&puuid).cloned());
        }
    }

    Ok(None)
}

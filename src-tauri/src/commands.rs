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

    // Clear party cache when idle (no match)
    *state.parties_match_id.write() = None;

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

/// Get parties with caching - only fetches once per match_id
async fn get_cached_parties(
    state: &State<'_, AppState>,
    match_id: &str,
    puuids: &[String],
    api: &crate::api::ValorantAPI,
) -> HashMap<String, String> {
    // Check cache
    {
        let cached_match = state.parties_match_id.read();
        if cached_match.as_ref() == Some(&match_id.to_string()) {
            return state.cached_parties.read().clone();
        }
    }

    // Fetch fresh
    let parties = api.detect_parties(puuids).await;

    // Update cache
    *state.parties_match_id.write() = Some(match_id.to_string());
    *state.cached_parties.write() = parties.clone();

    parties
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

use crate::api::ValorantAPI;
use crate::api::types::PlayerSkinData;
use parking_lot::RwLock;
use std::collections::{HashMap, HashSet};
use std::sync::Arc;

pub struct AppState {
    pub api: Arc<ValorantAPI>,
    pub auto_lock_agent: RwLock<Option<String>>,
    // Cache for party detection - persists across pregame->ingame transition
    pub cached_parties: RwLock<HashMap<String, String>>,
    // Track if we're in an active game session (pregame or ingame)
    pub in_game_session: RwLock<bool>,
    // Cache for players whose match history has been fetched this game session
    pub fetched_history_players: RwLock<HashSet<String>>,
    // Cache for player loadouts - puuid -> skins
    pub cached_loadouts: RwLock<HashMap<String, PlayerSkinData>>,
    pub loadouts_match_id: RwLock<Option<String>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            api: Arc::new(ValorantAPI::new()),
            auto_lock_agent: RwLock::new(None),
            cached_parties: RwLock::new(HashMap::new()),
            in_game_session: RwLock::new(false),
            fetched_history_players: RwLock::new(HashSet::new()),
            cached_loadouts: RwLock::new(HashMap::new()),
            loadouts_match_id: RwLock::new(None),
        }
    }
}

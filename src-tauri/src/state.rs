use crate::api::ValorantAPI;
use crate::api::types::PlayerSkinData;
use parking_lot::RwLock;
use std::collections::{HashMap, HashSet};
use std::sync::Arc;

pub struct AppState {
    pub api: Arc<ValorantAPI>,
    pub auto_lock_agent: RwLock<Option<String>>,
    // Cache for party detection - only fetch once per match
    pub cached_parties: RwLock<HashMap<String, String>>,
    pub parties_match_id: RwLock<Option<String>>,
    // Cache for players whose match history has been fetched this game session
    // Cleared when match_id changes (new game)
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
            parties_match_id: RwLock::new(None),
            fetched_history_players: RwLock::new(HashSet::new()),
            cached_loadouts: RwLock::new(HashMap::new()),
            loadouts_match_id: RwLock::new(None),
        }
    }
}

use crate::api::ValorantAPI;
use parking_lot::RwLock;
use std::collections::HashMap;
use std::sync::Arc;

pub struct AppState {
    pub api: Arc<ValorantAPI>,
    pub auto_lock_agent: RwLock<Option<String>>,
    // Cache for party detection - only fetch once per match
    pub cached_parties: RwLock<HashMap<String, String>>,
    pub parties_match_id: RwLock<Option<String>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            api: Arc::new(ValorantAPI::new()),
            auto_lock_agent: RwLock::new(None),
            cached_parties: RwLock::new(HashMap::new()),
            parties_match_id: RwLock::new(None),
        }
    }
}

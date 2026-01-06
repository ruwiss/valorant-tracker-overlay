use crate::api::types::*;
use base64::{engine::general_purpose::STANDARD, Engine};
use parking_lot::RwLock;
use reqwest::Client;
use std::collections::HashMap;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("Valorant not running")]
    NotRunning,
    #[error("Request failed: {0}")]
    RequestFailed(String),
    #[error("Parse error: {0}")]
    ParseError(String),
}

pub struct ValorantAPI {
    client: Client,
    pub puuid: RwLock<String>,
    pub region: RwLock<String>,
    pub shard: RwLock<String>,
    local_port: RwLock<String>,
    local_auth: RwLock<String>,
    remote_headers: RwLock<HashMap<String, String>>,
    pub connected: RwLock<bool>,
}

impl ValorantAPI {
    pub fn new() -> Self {
        let client = Client::builder()
            .danger_accept_invalid_certs(true)
            .build()
            .unwrap();

        Self {
            client,
            puuid: RwLock::new(String::new()),
            region: RwLock::new(String::new()),
            shard: RwLock::new(String::new()),
            local_port: RwLock::new(String::new()),
            local_auth: RwLock::new(String::new()),
            remote_headers: RwLock::new(HashMap::new()),
            connected: RwLock::new(false),
        }
    }

    pub async fn initialize(&self) -> Result<ConnectionStatus, ApiError> {
        let lockfile_path = format!(
            "{}\\Riot Games\\Riot Client\\Config\\lockfile",
            std::env::var("LOCALAPPDATA").unwrap_or_default()
        );

        let lockfile_content = std::fs::read_to_string(&lockfile_path)
            .map_err(|_| ApiError::NotRunning)?;

        let parts: Vec<&str> = lockfile_content.split(':').collect();
        if parts.len() < 4 {
            return Err(ApiError::ParseError("Invalid lockfile".into()));
        }

        let port = parts[2].to_string();
        let password = parts[3].to_string();
        let auth = STANDARD.encode(format!("riot:{}", password));

        *self.local_port.write() = port.clone();
        *self.local_auth.write() = format!("Basic {}", auth);

        // Get entitlements
        let ent_url = format!("https://127.0.0.1:{}/entitlements/v1/token", port);
        let ent_response: EntitlementsResponse = self
            .client
            .get(&ent_url)
            .header("Authorization", format!("Basic {}", auth))
            .send()
            .await
            .map_err(|e| ApiError::RequestFailed(e.to_string()))?
            .json()
            .await
            .map_err(|e| ApiError::ParseError(e.to_string()))?;

        *self.puuid.write() = ent_response.subject.clone();

        // Get client version
        let version = self.get_client_version().await;

        // Set remote headers
        {
            let mut headers = self.remote_headers.write();
            headers.insert("Authorization".into(), format!("Bearer {}", ent_response.access_token));
            headers.insert("X-Riot-Entitlements-JWT".into(), ent_response.token);
            headers.insert("X-Riot-ClientPlatform".into(), "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9".into());
            headers.insert("X-Riot-ClientVersion".into(), version);
            headers.insert("Content-Type".into(), "application/json".into());
        }

        // Get region from sessions
        let sessions_url = format!("https://127.0.0.1:{}/product-session/v1/external-sessions", port);
        if let Ok(resp) = self.client
            .get(&sessions_url)
            .header("Authorization", format!("Basic {}", auth))
            .send()
            .await
        {
            if let Ok(sessions) = resp.json::<HashMap<String, SessionData>>().await {
                for (_, session) in sessions {
                    if let Some(config) = session.launch_configuration {
                        if let Some(args) = config.arguments {
                            for arg in args {
                                if arg.contains("-ares-deployment=") {
                                    let region = arg.split('=').nth(1).unwrap_or("tr").to_string();
                                    *self.region.write() = region.clone();
                                }
                                if arg.contains("-config-endpoint=") {
                                    if let Some(endpoint) = arg.split('=').nth(1) {
                                        let parts: Vec<&str> = endpoint.split('.').collect();
                                        if parts.len() > 1 {
                                            *self.shard.write() = parts[1].to_string();
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Default region/shard
        if self.region.read().is_empty() {
            *self.region.write() = "tr".to_string();
        }
        if self.shard.read().is_empty() {
            *self.shard.write() = self.get_shard(&self.region.read());
        }

        *self.connected.write() = true;

        Ok(ConnectionStatus {
            connected: true,
            region: self.region.read().to_uppercase(),
            message: "Connected".into(),
        })
    }

    fn get_shard(&self, region: &str) -> String {
        match region.to_lowercase().as_str() {
            "eu" | "tr" => "eu",
            "na" | "latam" | "br" => "na",
            "ap" => "ap",
            "kr" => "kr",
            _ => "eu",
        }.to_string()
    }

    async fn get_client_version(&self) -> String {
        if let Ok(resp) = self.client
            .get("https://valorant-api.com/v1/version")
            .send()
            .await
        {
            if let Ok(data) = resp.json::<VersionResponse>().await {
                if let Some(d) = data.data {
                    if let Some(v) = d.riot_client_version {
                        return v;
                    }
                }
            }
        }
        "release-09.10-shipping-18-2775386".to_string()
    }

    fn glz_url(&self, endpoint: &str) -> String {
        let region = self.region.read();
        let shard = self.shard.read();
        let glz_region = if region.to_lowercase() == "tr" { "eu" } else { &region };
        format!("https://glz-{}-1.{}.a.pvp.net{}", glz_region, shard, endpoint)
    }

    fn pd_url(&self, endpoint: &str) -> String {
        let shard = self.shard.read();
        format!("https://pd.{}.a.pvp.net{}", shard, endpoint)
    }

    async fn get_remote<T: serde::de::DeserializeOwned>(&self, url: &str) -> Option<T> {
        let headers: HashMap<String, String> = self.remote_headers.read().clone();
        let mut req = self.client.get(url);
        for (k, v) in headers.iter() {
            req = req.header(k, v);
        }
        req.send().await.ok()?.json().await.ok()
    }

    async fn post_remote(&self, url: &str) -> Option<serde_json::Value> {
        let headers: HashMap<String, String> = self.remote_headers.read().clone();
        let mut req = self.client.post(url);
        for (k, v) in headers.iter() {
            req = req.header(k, v);
        }
        req.json(&serde_json::json!({})).send().await.ok()?.json().await.ok()
    }

    pub async fn get_pregame_match_id(&self) -> Option<String> {
        let puuid = self.puuid.read().clone();
        let url = self.glz_url(&format!("/pregame/v1/players/{}", puuid));
        let data: PregamePlayer = self.get_remote(&url).await?;
        data.match_id
    }

    pub async fn get_pregame_match(&self, match_id: &str) -> Option<PregameMatch> {
        let url = self.glz_url(&format!("/pregame/v1/matches/{}", match_id));
        self.get_remote(&url).await
    }

    pub async fn get_coregame_match_id(&self) -> Option<String> {
        let puuid = self.puuid.read().clone();
        let url = self.glz_url(&format!("/core-game/v1/players/{}", puuid));
        let data: CoregamePlayer = self.get_remote(&url).await?;
        data.match_id
    }

    pub async fn get_coregame_match(&self, match_id: &str) -> Option<CoregameMatch> {
        let url = self.glz_url(&format!("/core-game/v1/matches/{}", match_id));
        self.get_remote(&url).await
    }

    pub async fn get_player_names(&self, puuids: &[String]) -> HashMap<String, String> {
        let url = self.pd_url("/name-service/v2/players");
        let headers: HashMap<String, String> = self.remote_headers.read().clone();
        let mut req = self.client.put(&url);
        for (k, v) in headers.iter() {
            req = req.header(k, v);
        }

        let mut names = HashMap::new();
        if let Ok(resp) = req.json(&puuids).send().await {
            if let Ok(data) = resp.json::<Vec<PlayerNameInfo>>().await {
                for p in data {
                    let name = if p.tag_line.is_empty() {
                        p.game_name
                    } else {
                        format!("{}#{}", p.game_name, p.tag_line)
                    };
                    names.insert(p.subject, name);
                }
            }
        }
        names
    }

    pub async fn select_agent(&self, match_id: &str, agent_id: &str) {
        let url = self.glz_url(&format!("/pregame/v1/matches/{}/select/{}", match_id, agent_id));
        let _ = self.post_remote(&url).await;
    }

    pub async fn lock_agent(&self, match_id: &str, agent_id: &str) {
        let url = self.glz_url(&format!("/pregame/v1/matches/{}/lock/{}", match_id, agent_id));
        let _ = self.post_remote(&url).await;
    }

    /// Get presences from local chat API - returns puuid -> party_id map
    pub async fn get_presences(&self) -> HashMap<String, String> {
        let port = self.local_port.read().clone();
        let auth = self.local_auth.read().clone();
        let url = format!("https://127.0.0.1:{}/chat/v4/presences", port);

        let mut party_map = HashMap::new();

        if let Ok(resp) = self.client
            .get(&url)
            .header("Authorization", &auth)
            .send()
            .await
        {
            if let Ok(data) = resp.json::<PresencesResponse>().await {
                for p in data.presences {
                    if let Some(private_b64) = p.private {
                        if let Ok(decoded) = STANDARD.decode(&private_b64) {
                            if let Ok(json_str) = String::from_utf8(decoded) {
                                if let Ok(private_data) = serde_json::from_str::<PresencePrivate>(&json_str) {
                                    if let Some(party_id) = private_data.party_id {
                                        if !party_id.is_empty() {
                                            party_map.insert(p.puuid, party_id);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        party_map
    }

    /// Get my party info - returns (party_id, member_puuids)
    pub async fn get_my_party(&self) -> (Option<String>, Vec<String>) {
        let puuid = self.puuid.read().clone();
        let url = self.glz_url(&format!("/parties/v1/players/{}", puuid));

        if let Some(data) = self.get_remote::<PartyPlayerResponse>(&url).await {
            if let Some(party_id) = data.current_party_id {
                let party_url = self.glz_url(&format!("/parties/v1/parties/{}", party_id));
                if let Some(party_data) = self.get_remote::<PartyResponse>(&party_url).await {
                    let members: Vec<String> = party_data.members
                        .iter()
                        .filter_map(|m| m.subject.clone())
                        .collect();
                    return (Some(party_id), members);
                }
                return (Some(party_id), vec![puuid]);
            }
        }
        (None, vec![])
    }

    /// Detect parties for a list of players
    pub async fn detect_parties(&self, puuids: &[String]) -> HashMap<String, String> {
        let mut party_map: HashMap<String, String> = HashMap::new();
        let mut party_counter: HashMap<String, u32> = HashMap::new();
        let mut next_party_num: u32 = 1;

        // Get my party info
        let (my_party_id, my_party_members) = self.get_my_party().await;

        // Get presences for friends
        let presences = self.get_presences().await;

        for puuid in puuids {
            // Check if in my party
            if let Some(ref my_pid) = my_party_id {
                if my_party_members.contains(puuid) {
                    if !party_counter.contains_key(my_pid) {
                        party_counter.insert(my_pid.clone(), next_party_num);
                        next_party_num += 1;
                    }
                    party_map.insert(puuid.clone(), format!("Grup-{}", party_counter[my_pid]));
                    continue;
                }
            }

            // Check presences (friends)
            if let Some(friend_party_id) = presences.get(puuid) {
                if !party_counter.contains_key(friend_party_id) {
                    party_counter.insert(friend_party_id.clone(), next_party_num);
                    next_party_num += 1;
                }
                party_map.insert(puuid.clone(), format!("Grup-{}", party_counter[friend_party_id]));
            } else {
                party_map.insert(puuid.clone(), "Solo".into());
            }
        }

        // Filter single-person groups
        let mut party_sizes: HashMap<String, u32> = HashMap::new();
        for tag in party_map.values() {
            *party_sizes.entry(tag.clone()).or_insert(0) += 1;
        }

        for (puuid, tag) in party_map.iter_mut() {
            if party_sizes.get(tag).copied().unwrap_or(0) == 1 {
                *tag = "Solo".into();
            }
        }

        party_map
    }

    /// Get player MMR/rank
    pub async fn get_player_mmr(&self, puuid: &str) -> (u32, u32) {
        let url = self.pd_url(&format!("/mmr/v1/players/{}", puuid));
        if let Some(data) = self.get_remote::<MmrResponse>(&url).await {
            if let Some(queue_skills) = data.queue_skills {
                if let Some(competitive) = queue_skills.competitive {
                    return (competitive.competitive_tier.unwrap_or(0), competitive.ranked_rating.unwrap_or(0));
                }
            }
        }
        (0, 0)
    }
}

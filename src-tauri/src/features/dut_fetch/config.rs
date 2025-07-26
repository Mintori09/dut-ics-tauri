use serde::{Deserialize, Serialize};
use tokio::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct ConfigJson {
    pub dut_cookie: String,
    pub username: String,
    pub password: String,
    pub start_date: String,
}

const CONFIG_PATH: &str = "/home/mintori/.config/mintori/config.json";

pub async fn read_config() -> Result<ConfigJson, String> {
    let content = fs::read(CONFIG_PATH)
        .await
        .map_err(|e| format!("Failed to read config: {}", e))?;

    serde_json::from_slice(&content).map_err(|e| format!("Invalid JSON: {}", e))
}

pub async fn save_config(config: &ConfigJson) -> Result<(), String> {
    let json = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    fs::write(CONFIG_PATH, json)
        .await
        .map_err(|e| format!("Failed to write config: {}", e))
}

impl ConfigJson {
    pub async fn init() {
        let config = ConfigJson {
            dut_cookie: "".into(),
            username: "".into(),
            password: "".into(),
            start_date: "".into(),
        };

        save_config(&config)
            .await
            .expect("Can't create file config!");
    }
}

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tokio::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct ConfigJson {
    pub dut_cookie: String,
    pub username: String,
    pub password: String,
    pub start_date: String,
}

// Keep a relative constant (just the suffix)
const CONFIG_SUFFIX: &str = ".config/mintori/config.json";

fn config_path() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    Ok(home.join(CONFIG_SUFFIX))
}

pub async fn read_config() -> Result<ConfigJson, String> {
    let path = config_path()?;
    let content = fs::read(&path)
        .await
        .map_err(|e| format!("Failed to read config {}: {}", path.display(), e))?;
    serde_json::from_slice(&content).map_err(|e| format!("Invalid JSON: {}", e))
}

pub async fn save_config(config: &ConfigJson) -> Result<(), String> {
    let path = config_path()?;
    let json = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    // Ensure parent directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Failed to create config dir {}: {}", parent.display(), e))?;
    }

    fs::write(&path, json)
        .await
        .map_err(|e| format!("Failed to write config {}: {}", path.display(), e))
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

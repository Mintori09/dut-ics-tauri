use std::path::PathBuf;

use anyhow::{Result, anyhow};

use super::models::CommandType;

pub fn get_folder(command: CommandType) -> Result<PathBuf> {
    let mut path = get_home_dir().ok_or_else(|| anyhow!("Failed to read home directory path!"))?;
    path.push(".config");
    path.push("mintori");
    path.push("bash");
    match command {
        CommandType::Create => {
            path.push("create");
        }
        _ => {}
    }

    Ok(path)
}

pub fn get_home_dir() -> Option<PathBuf> {
    dirs::home_dir()
}

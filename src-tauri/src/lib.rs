// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod config;
mod features;
mod models;
mod utils;
mod video;
use config::config_env::set_env_backend;
use features::convert::ics_calendar::{from_markdown_to_ics, handle_schedule};
use utils::read_file::read_markdown_file;

use crate::features::translate::translate::translate_command;
use crate::video::read_video::duration_videos;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    set_env_backend().unwrap();
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            handle_schedule,
            read_markdown_file,
            from_markdown_to_ics,
            duration_videos,
            translate_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

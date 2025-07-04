// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod cli;
mod config;
mod features;
mod models;
mod utils;
mod video;
use std::env;

use crate::features::translates::translate::{translate_command, translate_stream_command};
use crate::video::read_video::duration_videos;
use config::config_env::set_env_backend;
use features::convert::ics_calendar::{from_markdown_to_ics, handle_schedule};
use utils::read_file::read_markdown_file;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    set_env_backend().unwrap();
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            handle_schedule,
            read_markdown_file,
            translate_stream_command,
            from_markdown_to_ics,
            duration_videos,
            translate_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

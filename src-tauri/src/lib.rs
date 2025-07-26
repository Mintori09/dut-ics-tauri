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
use features::dut_fetch::{create_new_cookie, fetch_schedule, fetch_schedule_by_id, fetch_score};
use models::course::convert_schedule_to_ics;
use utils::read_file::read_markdown_file;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    set_env_backend().unwrap();
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            convert_schedule_to_ics,
            read_markdown_file,
            translate_stream_command,
            fetch_schedule_by_id,
            duration_videos,
            translate_command,
            fetch_score,
            create_new_cookie,
            fetch_schedule
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

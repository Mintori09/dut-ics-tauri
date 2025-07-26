// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::env;

#[tokio::main]
async fn main() {
    // Nếu có tham số dòng lệnh, chạy CLI
    if env::args_os().len() > 1 {
        if let Err(e) = mintori::cli::cli().await {
            eprintln!("CLI error: {e}");
            std::process::exit(1);
        }
    } else {
        // Không có tham số, chạy GUI
        mintori::run(); // Chạy GUI
    }
}

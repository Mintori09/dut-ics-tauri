// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    if let Err(_e) = mintori::cli::cli() {
        std::process::exit(1);
    }

    mintori::run()
}

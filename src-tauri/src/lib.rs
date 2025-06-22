// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod cli;
mod video;
use crate::cli::{parse_courses_from_lines, Course, PrintTerminal};
use crate::video::read_video::duration_videos;

#[tauri::command]
fn read_markdown_file(path: &str) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn handle_schedule(contents: &str) -> Result<Vec<Course>, String> {
    match parse_courses_from_lines(contents).await {
        Ok(courses) => {
            println!("Ok");
            Ok(courses)
        }
        Err(e) => {
            eprintln!("Error parsing courses: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn from_markdown_to_ics(data: String, output_path: String) -> Result<(), String> {
    match cli::parse_courses_from_lines(&data).await {
        Ok(courses) => {
            courses.print_course();

            match cli::generate_ics_from_courses(&courses, &output_path) {
                Ok(_) => println!("Successfully generated calendar.ics at {:?}", output_path),
                Err(e) => eprintln!("Error generating ICS: {}", e),
            }
        }
        Err(e) => eprintln!("Error parsing courses: {}", e),
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            handle_schedule,
            read_markdown_file,
            from_markdown_to_ics,
            duration_videos
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

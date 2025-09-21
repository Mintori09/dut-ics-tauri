use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Video {
    pub id: String,
    pub file: String,
    pub title: String,
    pub watched: bool,
    pub duration: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Section {
    pub id: u32,
    pub name: String,
    pub videos: Vec<Video>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Course {
    pub course: String,
    pub sections: Vec<Section>,
}

use std::path::PathBuf;

fn get_course_file() -> PathBuf {
    let mut dir = dirs::config_dir().expect("Không tìm thấy config dir");
    dir.push("mintori");
    dir.push("course");
    std::fs::create_dir_all(&dir).expect("Không tạo được thư mục");
    dir.push("courses.json");
    dir
}

use std::fs;
#[tauri::command]
pub fn open_video(path: String) -> Result<(), String> {
    println!("Opening video at path: {}", path);

    std::process::Command::new("mpv")
        .arg(&path)
        .spawn()
        .map_err(|e| format!("Failed to open {}: {}", path, e))?;

    Ok(())
}

#[tauri::command]
pub fn read_videos(json_path: String) -> Result<Course, String> {
    let data = std::fs::read_to_string(json_path).map_err(|e| e.to_string())?;
    let course: Course = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    Ok(course)
}

#[tauri::command]
pub fn update_watched(json_path: String, video_id: String, watched: bool) -> Result<(), String> {
    // Đọc file
    let data = std::fs::read_to_string(&json_path).map_err(|e| e.to_string())?;
    let mut course: Course = serde_json::from_str(&data).map_err(|e| e.to_string())?;

    // Tìm video theo id và update
    for section in &mut course.sections {
        for video in &mut section.videos {
            if video.id == video_id {
                video.watched = watched;
            }
        }
    }

    // Ghi lại JSON
    let new_data = serde_json::to_string_pretty(&course).map_err(|e| e.to_string())?;
    std::fs::write(&json_path, new_data).map_err(|e| e.to_string())?;

    Ok(())
}

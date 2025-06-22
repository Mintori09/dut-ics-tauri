use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};

use serde::Serialize;

#[derive(Serialize)]
pub struct VideoDuration {
    pub video_path: String,
    pub duration: f64,
}

#[tauri::command]
pub async fn duration_videos(video_paths: Vec<String>) -> Result<Vec<VideoDuration>, String> {
    let mut video_durations: Vec<VideoDuration> = Vec::new();

    for video_path in video_paths {
        match get_video_duration(&video_path) {
            Ok(duration) => {
                video_durations.push(VideoDuration {
                    video_path,
                    duration,
                });
            }
            Err(e) => {
                eprintln!("Error: {}", e);
            }
        }
    }

    Ok(video_durations)
}

/// Gọi ffprobe và trả về thời lượng video (giây)
fn get_video_duration(video_path: &str) -> Result<f64, String> {
    let mut child = Command::new("ffprobe")
        .args(&[
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            video_path,
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|_| "Failed to start ffprobe. Is ffmpeg installed?".to_string())?;

    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();

    let output_thread = std::thread::spawn(move || {
        let mut output = String::new();
        BufReader::new(stdout).read_line(&mut output).ok();
        output
    });

    let error_thread = std::thread::spawn(move || {
        let mut error = String::new();
        BufReader::new(stderr).read_line(&mut error).ok();
        error
    });

    let status = child
        .wait()
        .map_err(|e| format!("Failed to wait on ffprobe: {}", e))?;

    if !status.success() {
        let error_output = error_thread.join().unwrap();
        return Err(format!("ffprobe error: {}", error_output.trim()));
    }

    let duration_str = output_thread.join().unwrap();
    duration_str
        .trim()
        .parse::<f64>()
        .map_err(|e| format!("Failed to parse duration: {}", e))
}

// In thời lượng video dưới dạng HH:MM:SS và tổng giây
// fn display_duration(duration: f64) {
//     let hours = (duration / 3600.0) as u64;
//     let minutes = ((duration % 3600.0) / 60.0) as u64;
//     let seconds = duration % 60.0;
//
//     println!("Video Duration:");
//     println!("  Total seconds: {:.3}", duration);
//     println!("  HH:MM:SS: {:02}:{:02}:{:05.2}", hours, minutes, seconds);
// }

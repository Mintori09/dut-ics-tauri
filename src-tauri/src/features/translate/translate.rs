use regex::Regex;
use rust_translate::translate;
use serde::Deserialize;
use srtlib::{Subtitle, Subtitles};
use std::fs;

#[derive(Debug, Deserialize)]
pub struct TranslateInput {
    pub input_path: String,
    pub output_path: String,
    pub from: String,
    pub to: String,
}

#[derive(Debug)]
pub enum FileType {
    SRT,
    TEXT,
    UNKNOWN,
}

fn detect_file_extension(filename: &str) -> FileType {
    let re = Regex::new(r"\.([a-zA-Z0-9]+)$").unwrap();
    if let Some(caps) = re.captures(filename) {
        match &caps[1].to_lowercase()[..] {
            "srt" => FileType::SRT,
            "txt" | "md" | "markdown" | "text" => FileType::TEXT,
            _ => FileType::UNKNOWN,
        }
    } else {
        FileType::UNKNOWN
    }
}

async fn translate_lines(lines: impl Iterator<Item = String>, from: &str, to: &str) -> Vec<String> {
    let mut translated = Vec::new();

    for line in lines {
        if line.trim().is_empty() {
            translated.push(String::new());
            continue;
        }

        match translate(&line, from, to).await {
            Ok(t) => translated.push(t),
            Err(e) => {
                eprintln!("❌ Lỗi dịch dòng: {}\n   → {}", line, e);
                translated.push(line);
            }
        }
    }

    translated
}

async fn translate_text_file(
    input_path: &str,
    output_path: &str,
    from: &str,
    to: &str,
) -> Result<(), String> {
    let input = fs::read_to_string(input_path).map_err(|e| e.to_string())?;
    let lines = input.lines().map(|s| s.to_string());

    let translated = translate_lines(lines, from, to).await;
    fs::write(output_path, translated.join("\n"))
        .map_err(|e| format!("❌ Không thể ghi file: {}", e))?;

    Ok(())
}

pub async fn translate_srt_file(
    input_path: &str,
    output_path: &str,
    from: &str,
    to: &str,
) -> Result<(), String> {
    let input = fs::read_to_string(input_path).map_err(|e| e.to_string())?;
    let blocks = Subtitles::parse_from_str(input).map_err(|e| e.to_string())?;

    let mut translated_blocks = Subtitles::new();

    for block in blocks {
        let translated_text = match translate(&block.text, from, to).await {
            Ok(t) => t,
            Err(e) => {
                eprintln!("❌ Dịch lỗi ở block #{}: {}", block.num, e);
                continue;
            }
        };

        translated_blocks.push(Subtitle {
            num: block.num,
            start_time: block.start_time,
            end_time: block.end_time,
            text: translated_text,
        });
    }

    translated_blocks
        .write_to_file(output_path, None)
        .map_err(|e| e.to_string())?;

    Ok(())
}

async fn translate_file(
    input_path: String,
    output_path: String,
    from: String,
    to: String,
) -> Result<String, String> {
    match detect_file_extension(&input_path) {
        FileType::SRT => {
            translate_srt_file(&input_path, &output_path, &from, &to).await?;
            Ok(format!("✅ Translated .srt file saved to {}", output_path))
        }
        FileType::TEXT => {
            translate_text_file(&input_path, &output_path, &from, &to).await?;
            Ok(format!("✅ Translated text file saved to {}", output_path))
        }
        FileType::UNKNOWN => Err("❓ Không nhận diện được định dạng file".into()),
    }
}

#[tauri::command]
pub async fn translate_command(params: TranslateInput) -> Result<String, String> {
    translate_file(
        params.input_path,
        params.output_path,
        params.from,
        params.to,
    )
    .await
}

use futures::future::join_all;
use regex::Regex;
use rust_translate::translate;
use serde::{Deserialize, Serialize};
use srtlib::{Subtitle, Subtitles};
use std::{fs, sync::Arc};
use tauri::{AppHandle, Emitter};
use tokio::sync::Semaphore;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TranslateInput {
    pub input_path: String,
    pub output_path: String,
    pub from: String,
    pub to: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TranslateOutput {
    pub translate_input: TranslateInput,
    pub is_translated: bool,
}

#[derive(Debug)]
pub enum FileType {
    Srt,
    Text,
    Unknown,
}

fn detect_file_extension(filename: &str) -> FileType {
    let re = Regex::new(r"\.([a-zA-Z0-9]+)$").unwrap();
    if let Some(caps) = re.captures(filename) {
        match &caps[1].to_lowercase()[..] {
            "srt" => FileType::Srt,
            "txt" | "md" | "markdown" | "text" => FileType::Text,
            _ => FileType::Unknown,
        }
    } else {
        FileType::Unknown
    }
}

pub async fn translate_text_file(
    input_path: &str,
    output_path: &str,
    from: &str,
    to: &str,
) -> Result<(), String> {
    let input = fs::read_to_string(input_path).map_err(|e| e.to_string())?;
    let lines: Vec<String> = input.lines().map(|s| s.to_string()).collect();

    let semaphore = Arc::new(Semaphore::new(5));
    let mut tasks = Vec::new();

    for line in lines.iter().cloned() {
        let permit = semaphore.clone().acquire_owned().await.unwrap();
        let from = from.to_string();
        let to = to.to_string();

        let task = tokio::spawn(async move {
            let _permit = permit;
            if line.trim().is_empty() {
                return Some(String::new());
            }
            match translate(&line, &from, &to).await {
                Ok(t) => {
                    println!("{}", t);
                    Some(t)
                }
                Err(e) => {
                    eprintln!("❌ Dịch lỗi: {}\n   → {}", line, e);
                    Some(line)
                }
            }
        });
        tasks.push(task);
    }

    let results = join_all(tasks).await;
    let mut translated_text = Vec::new();

    for result in results {
        if let Ok(Some(translated)) = result {
            translated_text.push(translated);
        } else {
            translated_text.push(String::from(""));
        }
    }

    fs::write(output_path, translated_text.join("\n"))
        .map_err(|e| format!("❌ Không thể ghi file: {}", e))?;

    Ok(())
}

pub async fn translate_srt_file(
    input_path: &str,
    output_path: &str,
    from: &str,
    to: &str,
) -> Result<(), String> {
    println!("{:?}", output_path);
    let input = fs::read_to_string(input_path).map_err(|e| e.to_string())?;
    let blocks = Subtitles::parse_from_str(input).map_err(|e| e.to_string())?;
    for sub in &blocks {
        println!("{}", sub);
    }

    let semaphore = Arc::new(Semaphore::new(5));
    let mut tasks = Vec::new();

    for block in blocks.clone() {
        let permit = semaphore.clone().acquire_owned().await.unwrap();

        let from = from.to_string();
        let to = to.to_string();
        let text = block.text.clone();
        let num = block.num;
        let start = block.start_time;
        let end = block.end_time;

        let task = tokio::spawn(async move {
            let _permit = permit;

            match translate(&text, &from, &to).await {
                Ok(translated) => {
                    println!("{}", translated);
                    Some(Subtitle {
                        num,
                        start_time: start,
                        end_time: end,
                        text: translated,
                    })
                }
                Err(e) => {
                    eprintln!("❌ Dịch lỗi ở block #{}: {}", num, e);
                    None
                }
            }
        });

        tasks.push(task);
    }

    let results = join_all(tasks).await;

    let mut translated_blocks = Subtitles::new();
    for result in results {
        if let Ok(Some(sub)) = result {
            translated_blocks.push(sub);
        }
    }

    translated_blocks
        .write_to_file(output_path, None)
        .map_err(|e| e.to_string())?;

    println!("Saved : {}", output_path);

    Ok(())
}

async fn translate_file(
    input_path: String,
    output_path: String,
    from: String,
    to: String,
) -> Result<String, String> {
    match detect_file_extension(&input_path) {
        FileType::Srt => {
            println!("Started translate srt file!: {}", input_path);
            translate_text_file(&input_path, &output_path, &from, &to).await?;
            Ok(format!("✅ Translated .srt file saved to {}", output_path))
        }
        FileType::Text => {
            println!("Started translate text file!");
            translate_text_file(&input_path, &output_path, &from, &to).await?;
            Ok(format!("✅ Translated text file saved to {}", output_path))
        }
        FileType::Unknown => Err("❓ Không nhận diện được định dạng file".into()),
    }
}

#[tauri::command]
pub async fn translate_command(props: TranslateInput) -> Result<String, String> {
    translate_file(props.input_path, props.output_path, props.from, props.to).await
}

#[tauri::command]
pub async fn translate_stream_command(
    batch: Vec<TranslateInput>,
    app_handle: AppHandle,
) -> Result<(), String> {
    for input in batch {
        let app = app_handle.clone();
        tokio::spawn(async move {
            let result = translate_file(
                input.input_path.clone(),
                input.output_path.clone(),
                input.from.clone(),
                input.to.clone(),
            )
            .await;

            let output = TranslateOutput {
                translate_input: input,
                is_translated: result.is_ok(),
            };

            if let Err(e) = app.emit("file-translated", output) {
                eprintln!("❌ Emit failed: {}", e);
            }
        });
    }

    Ok(())
}

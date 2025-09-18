// src-tauri/src/features/pictures/zip_images.rs

use reqwest::header::{CONTENT_DISPOSITION, CONTENT_TYPE};
use std::fs::File;
use std::io::Write;
use std::time::Duration;
use tauri::command;
use zip::CompressionMethod;
use zip::write::{ExtendedFileOptions, FileOptions};

#[derive(Debug, serde::Serialize)]
pub struct ZipItemResult {
    pub url: String,
    pub file_name: String,
    pub ok: bool,
    pub error: Option<String>,
}

#[command]
pub async fn zip_images(
    urls: Vec<String>,
    dest_path: String,
) -> Result<Vec<ZipItemResult>, String> {
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (compatible; TauriZip/1.0)")
        .connect_timeout(Duration::from_secs(10))
        .timeout(Duration::from_secs(60))
        .build()
        .map_err(|e| e.to_string())?;

    let file = File::create(&dest_path).map_err(|e| e.to_string())?;
    let mut zip = zip::ZipWriter::new(file);

    let mut results = Vec::with_capacity(urls.len());

    for (i, u) in urls.iter().enumerate() {
        let mut item = ZipItemResult {
            url: u.clone(),
            file_name: String::new(),
            ok: false,
            error: None,
        };

        let mut resp = match client.get(u).send().await {
            Ok(r) => r,
            Err(e) => {
                item.error = Some(e.to_string());
                results.push(item);
                continue;
            }
        };

        if !resp.status().is_success() {
            item.error = Some(format!("HTTP {}", resp.status()));
            results.push(item);
            continue;
        }

        // Tên + đuôi file
        let ext_from_ct = resp
            .headers()
            .get(CONTENT_TYPE)
            .and_then(|v| v.to_str().ok())
            .and_then(ext_from_mime);

        let name_from_cd = resp
            .headers()
            .get(CONTENT_DISPOSITION)
            .and_then(|v| v.to_str().ok())
            .and_then(filename_from_content_disposition);

        let name_from_url = filename_from_url_path(u);

        let base = name_from_cd
            .or(name_from_url)
            .unwrap_or_else(|| format!("{:03}", i + 1));

        let ext = ext_from_ct.or_else(|| ext_from_path(u)).unwrap_or("bin");
        let file_name = ensure_extension(&sanitize_file_name(&base), ext);
        item.file_name = file_name.clone();

        // Tạo FileOptions inline để tránh move reuse (không còn E0382)
        zip.start_file::<_, ExtendedFileOptions>(
            &file_name,
            FileOptions::default().compression_method(CompressionMethod::Deflated),
        )
        .map_err(|e| e.to_string())?;

        // Stream dữ liệu vào entry
        let mut wrote_any = false;
        loop {
            match resp.chunk().await {
                Ok(Some(chunk)) => {
                    wrote_any = true;
                    if let Err(e) = zip.write_all(&chunk) {
                        item.error = Some(e.to_string());
                        break;
                    }
                }
                Ok(None) => break,
                Err(e) => {
                    item.error = Some(e.to_string());
                    break;
                }
            }
        }

        if item.error.is_none() && !wrote_any {
            item.error = Some("empty body".to_string());
        }
        item.ok = item.error.is_none();
        results.push(item);
    }

    zip.finish().map_err(|e| e.to_string())?;
    Ok(results)
}

// ---------- helpers ----------

fn ext_from_mime(mime: &str) -> Option<&'static str> {
    match mime.split(';').next()?.trim() {
        "image/jpeg" => Some("jpg"),
        "image/png" => Some("png"),
        "image/webp" => Some("webp"),
        "image/gif" => Some("gif"),
        "image/bmp" => Some("bmp"),
        "image/tiff" => Some("tif"),
        "image/svg+xml" => Some("svg"),
        _ => None,
    }
}

fn filename_from_content_disposition(cd: &str) -> Option<String> {
    // hỗ trợ filename*=UTF-8''... và filename=...
    let lower = cd.to_ascii_lowercase();

    if let Some(idx) = lower.find("filename*=") {
        let val = &cd[idx + 10..];
        let v = val.split(';').next()?.trim().trim_matches('"');
        if let Some(encoded) = v.split("''").nth(1) {
            if let Ok(s) = percent_decode(encoded) {
                if !s.is_empty() {
                    return Some(s);
                }
            }
        }
    }
    if let Some(idx) = lower.find("filename=") {
        let val = &cd[idx + 9..];
        let v = val.split(';').next()?.trim().trim_matches('"');
        if !v.is_empty() {
            return Some(v.to_string());
        }
    }
    None
}

fn filename_from_url_path(u: &str) -> Option<String> {
    let qless = u.split('?').next().unwrap_or(u);
    let last = qless.rsplit('/').next()?;
    if last.is_empty() {
        None
    } else {
        Some(last.to_string())
    }
}

fn ext_from_path(u: &str) -> Option<&'static str> {
    let p = u.split('?').next().unwrap_or(u).to_ascii_lowercase();
    for &(needle, ext) in &[
        (".jpeg", "jpg"),
        (".jpg", "jpg"),
        (".png", "png"),
        (".webp", "webp"),
        (".gif", "gif"),
        (".bmp", "bmp"),
        (".tiff", "tif"),
        (".svg", "svg"),
    ] {
        if p.contains(needle) {
            return Some(ext);
        }
    }
    None
}

fn ensure_extension(file_name: &str, ext: &str) -> String {
    let low = file_name.to_ascii_lowercase();
    let dot_ext = format!(".{ext}");
    if low.ends_with(&dot_ext) {
        file_name.to_string()
    } else {
        format!("{file_name}.{ext}")
    }
}

fn sanitize_file_name(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for ch in s.chars() {
        match ch {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => out.push('_'),
            _ => out.push(ch),
        }
    }
    out
}

// percent-decode tối giản (ASCII)
fn percent_decode(s: &str) -> Result<String, ()> {
    let bytes = s.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            let hi = (bytes[i + 1] as char).to_digit(16).ok_or(())?;
            let lo = (bytes[i + 2] as char).to_digit(16).ok_or(())?;
            out.push(((hi << 4) | lo) as u8);
            i += 3;
        } else {
            out.push(bytes[i]);
            i += 1;
        }
    }
    String::from_utf8(out).map_err(|_| ())
}

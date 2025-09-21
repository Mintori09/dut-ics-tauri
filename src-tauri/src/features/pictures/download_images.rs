// src-tauri/src/features/pictures/download_images.rs

use std::fs::{File, create_dir_all};
use std::path::{Path, PathBuf};
use tauri::command;

use crate::features::pictures::common::{
    build_download_client, derive_filename, fetch_url, stream_response_into_writer,
};

#[derive(Debug, serde::Serialize)]
pub struct DownloadItemResult {
    pub url: String,
    pub file_path: String, // full path written
    pub ok: bool,
    pub error: Option<String>,
}

#[command]
pub async fn download_images(
    urls: Vec<String>,
    dest_dir: String,
) -> Result<Vec<DownloadItemResult>, String> {
    let client = build_download_client()?;
    ensure_dir_exists(&dest_dir)?;
    let mut results = Vec::with_capacity(urls.len());

    for (i, url) in urls.iter().enumerate() {
        results.push(download_one_to_file(&client, i, url, &dest_dir).await);
    }

    Ok(results)
}

/* ---------------- helpers ---------------- */

fn ensure_dir_exists(dir: &str) -> Result<(), String> {
    create_dir_all(dir).map_err(|e| e.to_string())
}

// NEW: tách stem/ext từ một tên file
fn split_stem_ext(name: &str) -> (String, Option<String>) {
    let p = Path::new(name);
    let stem = p
        .file_stem()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| "file".into());
    let ext = p.extension().map(|e| e.to_string_lossy().into_owned());
    (stem, ext)
}

// NEW: tìm tên file chưa tồn tại: "stem.ext", "stem (1).ext", "stem (2).ext", ...
fn next_nonexistent_path(dir: &Path, stem: &str, ext: Option<&str>) -> PathBuf {
    let mut i: u32 = 0;
    loop {
        let filename = if i == 0 {
            match ext {
                Some(e) => format!("{stem}.{e}"),
                None => stem.to_string(),
            }
        } else {
            match ext {
                Some(e) => format!("{stem} ({i}).{e}"),
                None => format!("{stem} ({i})"),
            }
        };
        let candidate = dir.join(&filename);
        if !candidate.exists() {
            return candidate;
        }
        i += 1;
    }
}

async fn download_one_to_file(
    client: &reqwest::Client,
    index: usize,
    url: &str,
    dest_dir: &str,
) -> DownloadItemResult {
    let mut item = DownloadItemResult {
        url: url.to_string(),
        file_path: String::new(),
        ok: false,
        error: None,
    };

    // 1) Fetch
    let resp = match fetch_url(client, url).await {
        Ok(r) => r,
        Err(e) => {
            item.error = Some(e);
            return item;
        }
    };
    if !resp.status().is_success() {
        item.error = Some(format!("HTTP {}", resp.status()));
        return item;
    }

    // 2) Base file name từ common.rs (có thể trả về 'image000.jpg')
    let file_name = derive_filename(index, url, &resp);

    // 2b) Đảm bảo KHÔNG ghi đè: chọn tên chưa tồn tại
    let (stem, ext) = split_stem_ext(&file_name);
    let dest_dir_path = Path::new(dest_dir);
    let unique_path = next_nonexistent_path(dest_dir_path, &stem, ext.as_deref());

    item.file_path = unique_path.to_string_lossy().into_owned();

    // 3) Tạo file và stream nội dung
    let mut f = match File::create(&unique_path) {
        Ok(h) => h,
        Err(e) => {
            item.error = Some(e.to_string());
            return item;
        }
    };

    match stream_response_into_writer(resp, &mut f).await {
        Ok(true) => {}
        Ok(false) => item.error = Some("empty body".to_string()),
        Err(e) => item.error = Some(e),
    }

    item.ok = item.error.is_none();
    item
}

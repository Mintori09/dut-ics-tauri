// src-tauri/src/features/pictures/zip_images.rs
use crate::features::pictures::common::{
    build_download_client, derive_filename, fetch_url, finish_zip, start_zip_entry,
    stream_response_into_writer,
};
use std::fs::File;
use tauri::command;
use zip::ZipWriter;

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
    let client = build_download_client()?;
    let mut zip = open_dest_zip(&dest_path)?;

    let mut results = Vec::with_capacity(urls.len());
    for (i, url) in urls.iter().enumerate() {
        results.push(process_single_url(&client, &mut zip, i, url).await);
    }

    finish_zip(zip)?;
    Ok(results)
}

fn open_dest_zip(dest_path: &str) -> Result<ZipWriter<File>, String> {
    let file = File::create(dest_path).map_err(|e| e.to_string())?;
    Ok(ZipWriter::new(file))
}

async fn process_single_url(
    client: &reqwest::Client,
    zip: &mut ZipWriter<File>,
    index: usize,
    url: &str,
) -> ZipItemResult {
    let mut item = ZipItemResult {
        url: url.to_string(),
        file_name: String::new(),
        ok: false,
        error: None,
    };

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

    let file_name = derive_filename(index, url, &resp);
    item.file_name = file_name.clone();

    if let Err(e) = start_zip_entry(zip, &file_name) {
        item.error = Some(e);
        return item;
    }

    match stream_response_into_writer(resp, zip).await {
        Ok(true) => {}
        Ok(false) => item.error = Some("empty body".to_string()),
        Err(e) => item.error = Some(e),
    }

    item.ok = item.error.is_none();
    item
}

// src-tauri/src/features/pictures/scrape_images.rs
use crate::features::pictures::common::{build_download_client, scrape_image_urls};
use serde::Serialize;
use tauri::command;
use url::Url;

#[derive(Serialize)]
pub struct ImageInfo {
    url: String,
}

#[command]
pub async fn scrape_images(target: String) -> Result<Vec<ImageInfo>, String> {
    let base = Url::parse(&target).map_err(|e| e.to_string())?;
    let client = build_download_client()?;

    let html = client
        .get(base.clone())
        .send()
        .await
        .map_err(|e| e.to_string())?
        .error_for_status()
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;

    let urls = scrape_image_urls(&html, base);
    Ok(urls.into_iter().map(|url| ImageInfo { url }).collect())
}

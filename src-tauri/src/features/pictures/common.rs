// src-tauri/src/features/pictures/common.rs

use reqwest::header::{CONTENT_DISPOSITION, CONTENT_TYPE};
use reqwest::{Client, Response};
use scraper::{Html, Selector};
use std::fs::File;
use std::io::Write;
use std::time::Duration;
use url::Url;
use zip::write::{ExtendedFileOptions, FileOptions};
use zip::{CompressionMethod, ZipWriter};

/* =============== HTTP CLIENT =============== */

pub fn build_download_client() -> Result<Client, String> {
    Client::builder()
        .user_agent("Mozilla/5.0 (compatible; TauriZip/1.0)")
        .redirect(reqwest::redirect::Policy::limited(10))
        .connect_timeout(Duration::from_secs(10))
        .timeout(Duration::from_secs(60))
        .build()
        .map_err(|e| e.to_string())
}

/* =============== HTTP FETCH =============== */

pub async fn fetch_url(client: &Client, url: &str) -> Result<Response, String> {
    client.get(url).send().await.map_err(|e| e.to_string())
}

/* =============== STREAM VÀO WRITER =============== */

pub async fn stream_response_into_writer<W: Write>(
    mut resp: Response,
    mut writer: W,
) -> Result<bool, String> {
    let mut wrote_any = false;
    loop {
        match resp.chunk().await {
            Ok(Some(chunk)) => {
                wrote_any = true;
                writer.write_all(&chunk).map_err(|e| e.to_string())?;
            }
            Ok(None) => break,
            Err(e) => return Err(e.to_string()),
        }
    }
    Ok(wrote_any)
}

/* =============== ZIP ENTRY =============== */

pub fn start_zip_entry(zip: &mut ZipWriter<File>, file_name: &str) -> Result<(), String> {
    zip.start_file::<_, ExtendedFileOptions>(
        file_name,
        FileOptions::default().compression_method(CompressionMethod::Deflated),
    )
    .map_err(|e| e.to_string())
}

pub fn finish_zip(mut zip: ZipWriter<File>) -> Result<(), String> {
    zip.finish().map_err(|e| e.to_string())?;
    Ok(())
}

/* =============== ĐẶT TÊN FILE =============== */

pub fn derive_filename(index: usize, url: &str, resp: &Response) -> String {
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

    let name_from_url = filename_from_url_path(url);

    let base = name_from_cd
        .or(name_from_url)
        .unwrap_or_else(|| format!("{:03}", index + 1));

    let ext = ext_from_ct.or_else(|| ext_from_path(url)).unwrap_or("bin");
    ensure_extension(&sanitize_file_name(&base), ext)
}

pub fn ext_from_mime(mime: &str) -> Option<&'static str> {
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

pub fn filename_from_content_disposition(cd: &str) -> Option<String> {
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

pub fn filename_from_url_path(u: &str) -> Option<String> {
    let qless = u.split('?').next().unwrap_or(u);
    let last = qless.rsplit('/').next()?;
    if last.is_empty() {
        None
    } else {
        Some(last.to_string())
    }
}

pub fn ext_from_path(u: &str) -> Option<&'static str> {
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

pub fn ensure_extension(file_name: &str, ext: &str) -> String {
    let low = file_name.to_ascii_lowercase();
    let dot_ext = format!(".{ext}");
    if low.ends_with(&dot_ext) {
        file_name.to_string()
    } else {
        format!("{file_name}.{ext}")
    }
}

pub fn sanitize_file_name(s: &str) -> String {
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
pub fn percent_decode(s: &str) -> Result<String, ()> {
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

/* =============== SCRAPE HELPERS =============== */

pub fn is_http(u: &Url) -> bool {
    matches!(u.scheme(), "http" | "https")
}

pub fn parse_srcset(srcset: &str) -> impl Iterator<Item = &str> {
    // "url1 1x, url2 2x, url3 100w" -> ["url1", "url2", "url3"]
    srcset.split(',').filter_map(|part| {
        part.trim()
            .split_whitespace()
            .next()
            .filter(|s| !s.is_empty())
    })
}

/// Extract URLs từ HTML (img/src, srcset, picture/source, meta og/twitter, link icon/preload)
pub fn scrape_image_urls(html: &str, mut base: Url) -> Vec<String> {
    let doc = Html::parse_document(html);

    // Respect <base href="...">
    if let Ok(sel_base) = Selector::parse("base[href]") {
        if let Some(el) = doc.select(&sel_base).next() {
            if let Some(href) = el.value().attr("href") {
                if let Ok(abs) = base.join(href) {
                    base = abs;
                }
            }
        }
    }

    let mut out = std::collections::BTreeSet::<String>::new();

    // <img ...> + lazy attrs
    if let Ok(sel_img) = Selector::parse("img") {
        for el in doc.select(&sel_img) {
            for attr in ["src", "data-src", "data-original", "data-lazy-src"] {
                if let Some(v) = el.value().attr(attr) {
                    if let Ok(u) = base.join(v) {
                        if is_http(&u) {
                            out.insert(u.to_string());
                        }
                    }
                }
            }
            if let Some(srcset) = el.value().attr("srcset") {
                for cand in parse_srcset(srcset) {
                    if let Ok(u) = base.join(cand) {
                        if is_http(&u) {
                            out.insert(u.to_string());
                        }
                    }
                }
            }
        }
    }

    // <source srcset> (inside <picture>)
    if let Ok(sel_source) = Selector::parse("source[srcset]") {
        for el in doc.select(&sel_source) {
            if let Some(srcset) = el.value().attr("srcset") {
                for cand in parse_srcset(srcset) {
                    if let Ok(u) = base.join(cand) {
                        if is_http(&u) {
                            out.insert(u.to_string());
                        }
                    }
                }
            }
        }
    }

    // Meta tags: og/twitter
    if let Ok(sel_meta) = Selector::parse(
        "meta[property='og:image'],\
         meta[property='og:image:secure_url'],\
         meta[name='twitter:image'],\
         meta[name='twitter:image:src']",
    ) {
        for el in doc.select(&sel_meta) {
            if let Some(c) = el.value().attr("content") {
                if let Ok(u) = base.join(c) {
                    if is_http(&u) {
                        out.insert(u.to_string());
                    }
                }
            }
        }
    }

    // link preload/icon as image
    if let Ok(sel_link) = Selector::parse("link[rel~='icon'],link[as='image'],link[rel~='preload']")
    {
        for el in doc.select(&sel_link) {
            if let Some(href) = el.value().attr("href") {
                if let Ok(u) = base.join(href) {
                    if is_http(&u) {
                        out.insert(u.to_string());
                    }
                }
            }
        }
    }

    out.into_iter().take(300).collect()
}

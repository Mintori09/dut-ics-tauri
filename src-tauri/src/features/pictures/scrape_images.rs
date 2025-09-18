use scraper::{Html, Selector};
use tauri::command;
use url::Url;

#[derive(serde::Serialize)]
pub struct ImageInfo {
    url: String,
}

fn is_http(u: &Url) -> bool {
    matches!(u.scheme(), "http" | "https")
}

fn parse_srcset(srcset: &str) -> impl Iterator<Item = &str> {
    // "url1 1x, url2 2x, url3 100w" -> ["url1", "url2", "url3"]
    srcset.split(',').filter_map(|part| {
        part.trim()
            .split_whitespace()
            .next()
            .filter(|s| !s.is_empty())
    })
}

#[command]
pub async fn scrape_images(target: String) -> Result<Vec<ImageInfo>, String> {
    let mut base = Url::parse(&target).map_err(|e| e.to_string())?;

    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Tauri) scraper")
        .redirect(reqwest::redirect::Policy::limited(10))
        .timeout(std::time::Duration::from_secs(15))
        .build()
        .map_err(|e| e.to_string())?;

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

    let doc = Html::parse_document(&html);

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
            // srcset on <img>
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

    // Optional: cap to avoid massive lists
    let mut list: Vec<ImageInfo> = out
        .into_iter()
        .take(300)
        .map(|url| ImageInfo { url })
        .collect();

    // Stable order (BTreeSet already sorted, but in case you switch sets)
    // list.sort_by(|a, b| a.url.cmp(&b.url));

    Ok(list)
}

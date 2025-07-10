use reqwest::Client;

use crate::features::dut_fetch::config::{ConfigJson, read_config};

pub async fn fetch_html(url: String) -> Result<String, String> {
    let cookie = match read_config().await {
        Ok(config) => config.DutCookie,
        Err(_) => {
            ConfigJson::init().await;
            read_config().await?.DutCookie
        }
    };

    use reqwest::header::{ACCEPT, COOKIE, HeaderMap, HeaderValue, REFERER, USER_AGENT};

    let mut headers = HeaderMap::new();
    headers.insert(
        COOKIE,
        HeaderValue::from_str(&cookie).map_err(|e| e.to_string())?,
    );
    headers.insert(
        USER_AGENT,
        HeaderValue::from_static("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"),
    );
    headers.insert(
        ACCEPT,
        HeaderValue::from_static("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
    );
    headers.insert(REFERER, HeaderValue::from_static("https://sv.dut.udn.vn/"));

    let client = Client::builder()
        .default_headers(headers)
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| e.to_string())?;

    let res = client.get(&url).send().await.map_err(|e| e.to_string())?;

    if res.status().is_redirection() {
        return Err("Don't have cookie".to_string());
    }

    if !res.status().is_success() {
        return Err(format!("Server returned error status: {}", res.status()));
    }

    let text = res
        .text()
        .await
        .map_err(|e| format!("Failed to read body: {}", e))?;
    Ok(text)
}

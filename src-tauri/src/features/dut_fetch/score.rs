use anyhow::Result;
use reqwest::{
    Client, Url,
    cookie::{CookieStore, Jar},
};
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    fmt::{self, Display},
    sync::Arc,
};
use tokio::fs;

#[tauri::command]
pub async fn fetch_dut(cookie: String) -> Result<String, String> {
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

    let res = client
        .get("https://sv.dut.udn.vn/PageKQRL.aspx")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let text = res.text().await.map_err(|e| e.to_string())?;
    Ok(text)
}

#[derive(Debug, Deserialize, Serialize)]
struct ConfigJson {
    DutCookie: String,
    username: String,
    password: String,
}
impl Display for ConfigJson {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Cookie:{}\nusername:{}\npassword:{}",
            self.DutCookie, self.username, self.password
        )
    }
}

#[tauri::command]
pub async fn create_new_cookie() -> Result<(), String> {
    set_cookie().await
}

async fn set_cookie() -> Result<(), String> {
    let path = "/home/mintori/.config/mintori/config.json";
    let file = fs::read(path).await.map_err(|e| e.to_string())?;

    let mut json: ConfigJson = serde_json::from_slice(&file).map_err(|e| e.to_string())?;

    let cookie_jar = Arc::new(Jar::default());

    let client = Client::builder()
        .cookie_provider(cookie_jar.clone())
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
        .build()
        .map_err(|e| e.to_string())?;

    let res = client
        .get("https://sv.dut.udn.vn/PageDangNhap.aspx")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let body = res.text().await.map_err(|e| e.to_string())?;

    let form_data = tokio::task::spawn_blocking(move || {
        let document = Html::parse_document(&body);
        let selector = Selector::parse("input").map_err(|e| e.to_string())?;
        let mut form_data = HashMap::new();

        for input in document.select(&selector) {
            let name = input.value().attr("name").unwrap_or_default();
            let value = input.value().attr("value").unwrap_or_default();
            if name.contains("__VIEWSTATE") || name.contains("__EVENTVALIDATION") {
                form_data.insert(name.to_string(), value.to_string());
            }
        }

        Ok::<_, String>(form_data)
    })
    .await
    .map_err(|e| e.to_string())??;

    let mut form_data = form_data;
    form_data.insert(
        "_ctl0:MainContent:DN_txtAcc".to_string(),
        json.username.to_string(),
    );
    form_data.insert(
        "_ctl0:MainContent:DN_txtPass".to_string(),
        json.password.to_string(),
    );
    form_data.insert(
        "_ctl0:MainContent:QLTH_btnLogin".to_string(),
        "Đăng nhập".to_string(),
    );

    client
        .post("https://sv.dut.udn.vn/PageDangNhap.aspx")
        .form(&form_data)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let domain_url = Url::parse("https://sv.dut.udn.vn").map_err(|e| e.to_string())?;
    let cookies = cookie_jar
        .cookies(&domain_url)
        .ok_or("No cookies found")?
        .to_str()
        .map_err(|_| "Invalid cookie string")?
        .to_string();

    json.DutCookie = cookies;

    let new_json = serde_json::to_string_pretty(&json).map_err(|e| e.to_string())?;
    println!("{}", new_json);

    fs::write(path, new_json).await.map_err(|e| e.to_string())?;
    Ok(())
}

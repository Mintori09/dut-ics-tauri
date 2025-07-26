use crate::features::dut_fetch::config;
use reqwest::{
    Client, Url,
    cookie::{CookieStore, Jar},
};
use scraper::{Html, Selector};
use std::collections::HashMap;
use std::sync::Arc;

pub fn parse_login_form(html: &str) -> Result<HashMap<String, String>, String> {
    let document = Html::parse_document(html);
    let selector = Selector::parse("input").map_err(|e| e.to_string())?;
    let mut form_data = HashMap::new();

    for input in document.select(&selector) {
        let name = input.value().attr("name").unwrap_or_default();
        let value = input.value().attr("value").unwrap_or_default();

        if name.contains("__VIEWSTATE") || name.contains("__EVENTVALIDATION") {
            form_data.insert(name.to_string(), value.to_string());
        }
    }

    Ok(form_data)
}

pub async fn set_cookie() -> Result<(), String> {
    let mut json = config::read_config().await?;
    let cookie = login_and_get_cookie(&json.username, &json.password).await?;

    json.dut_cookie = cookie;
    config::save_config(&json).await?;
    Ok(())
}

pub async fn login_and_get_cookie(username: &str, password: &str) -> Result<String, String> {
    let cookie_jar = Arc::new(Jar::default());

    let client = Client::builder()
        .cookie_provider(cookie_jar.clone())
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
        .build()
        .map_err(|e| format!("Failed to build client: {}", e))?;

    let login_url = "https://sv.dut.udn.vn/PageDangNhap.aspx";

    let res = client
        .get(login_url)
        .send()
        .await
        .map_err(|e| format!("GET error: {}", e))?;

    let body = res
        .text()
        .await
        .map_err(|e| format!("Read body failed: {}", e))?;

    let mut form_data = tokio::task::spawn_blocking(move || parse_login_form(&body))
        .await
        .map_err(|e| e.to_string())??;

    form_data.insert("_ctl0:MainContent:DN_txtAcc".into(), username.into());
    form_data.insert("_ctl0:MainContent:DN_txtPass".into(), password.into());
    form_data.insert("_ctl0:MainContent:QLTH_btnLogin".into(), "Đăng nhập".into());

    let post_res = client
        .post(login_url)
        .form(&form_data)
        .send()
        .await
        .map_err(|e| format!("POST error: {}", e))?;

    let _ = post_res.text().await.map_err(|e| e.to_string())?;

    let domain = Url::parse("https://sv.dut.udn.vn").unwrap();
    let cookie = cookie_jar
        .cookies(&domain)
        .ok_or("Không tìm thấy cookie!")?
        .to_str()
        .map_err(|_| "Cookie không hợp lệ!")?
        .to_string();

    Ok(cookie)
}

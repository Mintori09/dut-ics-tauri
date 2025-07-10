use request::fetch_html;

pub mod auth;
pub mod config;
pub mod parser;
pub mod request;
pub mod test;

#[tauri::command]
pub async fn fetch_score() -> Result<String, String> {
    let html = fetch_html("https://sv.dut.udn.vn/PageKQRL.aspx".into()).await?;
    let clean_html = html.replace("href=\"Styles/", "href=\"https://sv.dut.udn.vn/Styles/");
    Ok(clean_html)
}

#[tauri::command]
pub async fn fetch_schedule() -> Result<String, String> {
    let html = fetch_html("https://sv.dut.udn.vn/PageLichTH.aspx".into()).await?;
    let clean_html = html.replace("href=\"Styles/", "href=\"https://sv.dut.udn.vn/Styles/");
    Ok(clean_html)
}

#[tauri::command]
pub async fn create_new_cookie() -> Result<(), String> {
    auth::set_cookie().await
}

#[tauri::command]
pub async fn fetch_schedule_by_id(id: String) -> Result<String, String> {
    let url = format!(
        "https://sv.dut.udn.vn/WebAjax/evLopHP_Load.aspx?E=TTKBLoad&Code={}",
        id
    );
    let html = fetch_html(url).await?;
    let clean_html = html.replace("href=\"Styles/", "href=\"https://sv.dut.udn.vn/Styles/");
    Ok(clean_html)
}

#[cfg(test)]
mod tests {
    use crate::features::dut_fetch::{
        auth::login_and_get_cookie,
        config::{ConfigJson, read_config},
    };

    use super::*;

    #[tokio::test]
    async fn test_login_and_get_cookie_real() {
        let config: ConfigJson = read_config().await.unwrap();
        let username = config.username;
        let password = config.password;

        let result = login_and_get_cookie(&username, &password).await;

        assert!(result.is_ok());
        let cookie = result.unwrap();
        assert!(cookie.contains("ASP.NET_SessionId"));
    }
}

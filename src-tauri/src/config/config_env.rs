use std::env;

pub fn set_env_backend() -> Result<String, String> {
    unsafe {
        std::env::set_var("__GL_THREADED_OPTIMIZATIONS", "0");
        std::env::set_var("__NV_DISABLE_EXPLICIT_SYNC", "1");
        std::env::set_var("GDK_BACKEND", "x11");
    }
    println!(" ---> {}", env::var("GDK_BACKEND").unwrap());
    Ok("Set var success".to_string())
}

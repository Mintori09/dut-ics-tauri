use anyhow::Result;
use arboard::Clipboard;
use sha2::{Digest, Sha256};
use std::thread;
use std::time::Duration;

pub fn hashed_name(original_name: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(original_name);
    let result = hasher.finalize();
    format!("/{:x}", result)
}

pub fn copy_to_clipboard(text: &str) -> Result<()> {
    let mut clipboard = Clipboard::new()?;
    clipboard.set_text(text.to_string())?;
    // Giữ chương trình 1 lúc nếu bạn đang test trên Linux/X11
    #[cfg(target_os = "linux")]
    thread::sleep(Duration::from_millis(100));
    Ok(())
}

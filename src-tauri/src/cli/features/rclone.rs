use anyhow::{Result, anyhow};
use arboard::Clipboard;
use std::{ffi::OsStr, path::PathBuf, process::Stdio};
use tokio::{
    io::{AsyncBufReadExt, BufReader},
    process::Command,
};

use crate::cli::utils::hasher::{copy_to_clipboard, hashed_name};
pub async fn run_rclone_command(rclone_command: Vec<&str>, rclone_args: Vec<&str>) -> Result<()> {
    let mut child = Command::new("rclone")
        .args(&rclone_command)
        .args(&rclone_args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()?;

    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();

    let mut stdout_reader = BufReader::new(stdout).lines();
    let mut stderr_reader = BufReader::new(stderr).lines();

    let stdout_task = tokio::spawn(async move {
        while let Ok(Some(line)) = stdout_reader.next_line().await {
            println!("{}", line);
        }
    });

    let stderr_task = tokio::spawn(async move {
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            eprintln!("{}", line);
        }
    });

    let status = child.wait().await?;

    stdout_task.await?;
    stderr_task.await?;

    if !status.success() {
        return Err(anyhow!("Upload failed with exit code: {}", status));
    }

    Ok(())
}

pub async fn get_link(remote_path: &str) -> Result<String> {
    let mut child = Command::new("rclone")
        .arg("link")
        .arg(remote_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()?;

    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();

    let mut stdout_reader = BufReader::new(stdout).lines();
    let mut stderr_reader = BufReader::new(stderr).lines();

    let stdout_task = tokio::spawn(async move {
        let mut link = None;
        while let Ok(Some(line)) = stdout_reader.next_line().await {
            println!("[link-out] {}", line);
            if line.starts_with("http") {
                link = Some(line);
            }
        }
        link
    });

    let stderr_task = tokio::spawn(async move {
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            eprintln!("[link-err] {}", line);
        }
    });

    let status = child.wait().await?;
    let link = stdout_task.await?;
    stderr_task.await?;

    if !status.success() {
        return Err(anyhow!("Failed to get link"));
    }

    link.ok_or_else(|| anyhow!("No link found"))
}

pub async fn upload_and_get_link(path: &PathBuf) -> Result<()> {
    if !path.exists() {
        return Err(anyhow!("This path doesn't exist!"));
    }

    let original_name = path
        .to_str()
        .ok_or_else(|| anyhow!("Error, invalid path!"))?;
    let hash = hashed_name(original_name);
    let onedrive_path = "Onedrive:PublicUploads";
    let mut remote_path = String::from(onedrive_path);
    remote_path.push_str(&hash);

    if path.is_file() {
        let ext = path
            .extension()
            .and_then(OsStr::to_str)
            .map(|e| format!(".{}", e))
            .unwrap_or_default();

        let hash = hashed_name(original_name);
        remote_path.push_str(&hash);
        remote_path.push_str(&ext);
    } else {
        return Err(anyhow!("Folder upload is not supported yet!"));
    }

    println!("Upload to: {}", remote_path);

    let rclone_args = vec![
        "--progress",
        "--fast-list",
        "--transfers=8",
        "--checkers=32",
        "--tpslimit=10",
        "--tpslimit-burst=24",
        "--low-level-retries=10",
        "--timeout=60s",
        "--contimeout=15s",
        "--multi-thread-streams=8",
        "--onedrive-chunk-size=100M",
        "--buffer-size=64M",
    ];

    let rclone_command = vec!["copyto", original_name, &remote_path];
    println!("{}", remote_path);
    run_rclone_command(rclone_command, rclone_args).await?;
    let link = get_link(&remote_path).await?;
    copy_to_clipboard(&link)?;
    println!("Link : {}", link);
    println!("📋 Link copied to clipboard!");

    Ok(())
}

use anyhow::{Result, anyhow};
use std::{
    env, fs,
    path::{Path, PathBuf},
    process::Command,
};

#[derive(Debug)]
enum CommandArgs {
    Create,
    Run,
    Help,
}

#[warn(deprecated)]
pub fn create_folder_config_if_not_exist() -> Result<()> {
    if let Some(mut path) = env::home_dir() {
        path.push(".config");
        path.push("mintori");
        fs::create_dir_all(&path).expect("Failed");
        let mut bash_path = path.clone();
        bash_path.push("bash");
        fs::create_dir_all(&bash_path).expect("Failed");
        bash_path.push("create");
        fs::create_dir_all(&bash_path).expect("Failed");
    }
    Ok(())
}

pub fn cli_create(file: &str) -> Result<()> {
    let file_name = format!("{}.sh", file);
    let mut path: PathBuf = get_folder(CommandArgs::Create)?;
    path.push(&file_name);

    let content = fs::read_to_string(&path)?;
    let lines: Vec<String> = content.lines().map(|s| s.to_string()).collect();

    println!("File has {} lines.", lines.len());

    let status = Command::new("sh").arg(path.to_str().unwrap()).status()?;

    if !status.success() {
        eprintln!("Script `{}` exited with non-zero status.", file_name);
    }

    Ok(())
}

fn get_folder(command: CommandArgs) -> Result<PathBuf> {
    let mut path = env::home_dir().ok_or_else(|| anyhow!("Cannot get home directory"))?;
    println!("Ok");
    path.push(".config");
    path.push("mintori");
    path.push("bash");
    match command {
        CommandArgs::Create => {
            path.push("create");
        }
        _ => {}
    }

    Ok(path)
}

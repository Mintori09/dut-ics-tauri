use std::fs;

use anyhow::Result;
use clap::Parser;

use super::utils::get_home_dir;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
pub struct Cli {
    #[arg(short, long)]
    pub create: Option<String>,
}

impl Cli {
    pub fn init() -> Result<()> {
        if let Some(mut path) = get_home_dir() {
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
}

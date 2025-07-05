use anyhow::{Result, anyhow};
use clap::Parser;
use std::env;

use crate::config::config_linux::{cli_create, create_folder_config_if_not_exist};

use super::command::Args;

pub fn cli() -> Result<()> {
    create_folder_config_if_not_exist();
    let args = Args::parse();
    if env::args_os().len() <= 1 {
        return Ok(());
    }

    if let Some(file) = args.create {
        if let Ok(()) = cli_create(&file) {
            println!("Run successfully!");
        } else {
            println!("Error : file not exist!");
        };
        std::process::exit(1)
    } else {
        Err(anyhow!(
            "Missing command. Please provide a valid subcommand."
        ))
    }
}

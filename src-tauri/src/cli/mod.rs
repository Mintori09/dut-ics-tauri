pub mod command;
pub mod create;
pub mod models;
pub mod utils;

use anyhow::{Result, anyhow};
use clap::Parser;
use command::Cli;
use create::cli_create;
use std::env;

pub fn cli() -> Result<()> {
    Cli::init()?;
    let args = Cli::parse();
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

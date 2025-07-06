pub mod command;
pub mod features;
pub mod models;
pub mod utils;

use anyhow::{Result, anyhow};
use clap::Parser;
use command::Cli;
use features::create::cli_create;
use std::env;

pub fn cli() -> Result<()> {
    Cli::init()?;
    let args = Cli::parse();
    if env::args_os().len() <= 1 {
        return Ok(());
    }

    if let Some(file) = args.create {
        match cli_create(&file) {
            Ok(()) => {
                println!("Run successfully!");
            }
            Err(e) => println!("{}", e),
        }
        std::process::exit(1)
    } else {
        Err(anyhow!(
            "Missing command. Please provide a valid subcommand."
        ))
    }
}

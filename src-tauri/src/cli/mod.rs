pub mod command;
pub mod features;
pub mod models;
pub mod utils;

use anyhow::{Result, anyhow};
use clap::Parser;
use command::Cli;
use features::{create::cli_create, rclone::upload_and_get_link};

pub async fn cli() -> Result<()> {
    Cli::init()?; // nếu có

    let args = Cli::parse();

    match (args.create, args.link) {
        (Some(file), None) => {
            cli_create(&file)?;
            println!("Run successfully!");
        }
        (None, Some(path)) => {
            upload_and_get_link(&path).await?;
        }
        (None, None) => {
            return Err(anyhow!(
                "Missing command. Please provide a valid subcommand."
            ));
        }
        (Some(_), Some(_)) => {
            return Err(anyhow!("Please provide only one subcommand at a time."));
        }
    }

    Ok(())
}

use std::{
    io::{self, Write},
    process::Command,
};

use anyhow::Result;

use crate::cli::{models::CommandType, utils::get_folder};

pub fn cli_create(file: &str) -> Result<()> {
    let script_path = get_folder(CommandType::Create)?.join(format!("{}.sh", file));

    print!("Project name \x1b[90m(default: my-react-app)\x1b[0m :");
    io::stdout().flush()?;
    let mut input = String::new();
    io::stdin().read_line(&mut input)?;
    let project_name = input.trim();

    let status = Command::new("sh")
        .arg(&script_path)
        .arg(project_name)
        .status()?;

    if !status.success() {
        eprintln!(
            "Script `{}` exited with non-zero status.",
            script_path.display()
        );
    }

    Ok(())
}

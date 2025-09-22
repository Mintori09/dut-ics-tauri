import { homeDir, join } from "@tauri-apps/api/path";

export default async function getConfigDir() {
    const home = await homeDir();
    const configDir = await join(home, ".config", "mintori", "course");
    console.log(configDir);
    return configDir;
}

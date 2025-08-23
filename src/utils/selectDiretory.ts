import { open } from "@tauri-apps/plugin-dialog";

export async function selectDirectory(): Promise<string | undefined> {
  const dir = await open({
    directory: true,
    multiple: false,
  });

  if (dir && typeof dir === "string") {
    return dir;
  } else {
    console.warn("Directory not selected.");
    return undefined;
  }
}

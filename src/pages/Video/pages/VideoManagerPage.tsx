import { useEffect, useState } from "react";
import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { Card } from "../../../components/ui/card";
import getConfigDir from "../utils/getConfigDir";
import { useNavigate } from "react-router-dom";

export function VideoManagerPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFiles = async () => {
      const configDir = await getConfigDir();
      const dirEntries = await readDir(configDir);
      const jsonData: any[] = [];
      const entryList: any[] = [];

      for (const entry of dirEntries) {
        if (entry.name?.endsWith(".json") && entry.isFile) {
          const filePath = await join(configDir, entry.name);
          const content = await readTextFile(filePath);
          try {
            jsonData.push(JSON.parse(content));
            entryList.push({ ...entry, path: filePath });
          } catch (err) {
            console.error(`Invalid JSON in ${entry.name}`, err);
          }
        }
      }

      setVideos(jsonData);
      setEntries(entryList);
    };

    loadFiles();
  }, []);

  return (
    <div>
      {videos.map((v, idx) => (
        <Card
          key={idx}
          className="items-center cursor-pointer hover:bg-gray-100 p-4"
          onClick={() => navigate("/videos", { state: { JSON_PATH: entries[idx].path } })}
        >
          {v.course ?? entries[idx].name}
        </Card>
      ))}
    </div>
  );
}

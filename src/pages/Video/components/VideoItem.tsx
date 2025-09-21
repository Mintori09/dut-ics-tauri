import { invoke } from "@tauri-apps/api/core";
import { Checkbox } from "../../../components/ui/checkbox";
import { Video } from "../types/Video";
import { useState } from "react";
import { formatSecond } from "../tools/formatSecond";
import { Button } from "../../../components/ui/button";

type Props = {
  video: Video;
  jsonPath: string;
};

export default function VideoItem({ video, jsonPath }: Props) {
  const [videoState, setVideoState] = useState<Video>(video);

  const toggleWatched = async (checked: boolean | "indeterminate") => {
    const newWatched = checked === true;
    setVideoState({ ...videoState, watched: newWatched });

    try {
      await invoke("update_watched", {
        jsonPath,
        videoId: videoState.id,
        watched: newWatched,
      });
    } catch (err) {
      console.error("Update watched failed:", err);
      // rollback if backend fails
      setVideoState({ ...videoState, watched: !newWatched });
    }
  };

  const openVideo = async () => {
    try {
      await invoke("open_video", { path: video.file });
    } catch (err) {
      console.error("Open video failed:", err);
    }
  };

return (
  <div className="flex items-center justify-between gap-4">
    {/* Checkbox + Thông tin video */}
      <Checkbox
        checked={videoState.watched}
        onCheckedChange={toggleWatched}
      />
      <span className="font-medium flex-1">{video.title}</span>
      <span className="text-xs text-muted-foreground">
        {formatSecond(video.duration)}
      </span>

    <Button variant="default" size="sm" onClick={openVideo}>
      Open
    </Button>
  </div>
);

}

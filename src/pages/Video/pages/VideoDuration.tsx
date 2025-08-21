import { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Card } from "../../../components/ui/card";
import { Loader2 } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

interface VideoInfo {
  video_path: string;
  duration: number;
}

const VideoDuration = () => {
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemainder = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(secondsRemainder).padStart(2, "0")}`;
  };

  const handleSelectVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const selected = await open({
        multiple: true,
        directory: false,
        filters: [
          {
            name: "Video Files",
            extensions: ["mp4", "avi", "mov", "mkv", "webm"],
          },
        ],
      });
      if (!selected) return;
      const videoPaths = Array.isArray(selected) ? selected : [selected];
      const durations: VideoInfo[] = await invoke("duration_videos", {
        videoPaths,
      });
      setVideos(durations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get video durations",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Button onClick={handleSelectVideos} disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Processing..." : "Select Video Files"}
      </Button>

      {error && (
        <p className="text-red-500 mt-3 text-sm font-medium">Error: {error}</p>
      )}

      {videos.length > 0 && (
        <Card className="mt-6 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video File</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Seconds</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {video.video_path.split(/[\\/]/).pop()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDuration(video.duration)}
                  </TableCell>
                  <TableCell className="text-right">
                    {video.duration.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default VideoDuration;

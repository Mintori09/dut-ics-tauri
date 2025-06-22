import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { useState } from "react";
import { 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Typography
} from "@mui/material";

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
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secondsRemainder).padStart(2, '0')}`;
  };

  const handleSelectVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const selected = await open({
        multiple: true,
        directory: false,
        filters: [{
          name: "Video Files",
          extensions: ["mp4", "avi", "mov", "mkv", "webm"]
        }]
      });

      if (!selected) return;

      const videoPaths = Array.isArray(selected) ? selected : [selected];
      
      const durations: VideoInfo[] = await invoke("duration_videos", { 
        videoPaths 
      });

      setVideos(durations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get video durations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Button 
        variant="contained" 
        onClick={handleSelectVideos}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? "Processing..." : "Select Video Files"}
      </Button>

      {error && (
        <Typography color="error" style={{ marginTop: 10 }}>
          Error: {error}
        </Typography>
      )}

      {videos.length > 0 && (
        <TableContainer component={Paper} style={{ marginTop: 20 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Video File</TableCell>
                <TableCell align="right">Duration</TableCell>
                <TableCell align="right">Seconds</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {videos.map((video, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {video.video_path.split(/[\\/]/).pop()}
                  </TableCell>
                  <TableCell align="right">
                    {formatDuration(video.duration)}
                  </TableCell>
                  <TableCell align="right">
                    {video.duration.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default VideoDuration;

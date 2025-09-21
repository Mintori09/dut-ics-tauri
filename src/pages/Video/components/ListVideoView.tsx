import VideoItem from "./VideoItem";
import { Video } from "../types/Video";

type Props = {
    videos: Video[];
    jsonPath : string
};

export default function ListVideoView({ videos, jsonPath }: Props) {

    return (
        <div className="flex flex-col gap-3">
            {videos.map((video, _index) => (
                <VideoItem
                    key={video.id}
                    video={video}
                    jsonPath={jsonPath}
                />
            ))}
            {videos.length === 0 && (
                <p className="text-gray-500 text-sm">Không có video nào</p>
            )}
        </div>
    );
}



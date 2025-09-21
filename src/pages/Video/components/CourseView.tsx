import { useState } from "react";
import ListVideoView from "./ListVideoView";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Section } from "../types/Video";


type Props = {
    lessons: Section[];
    jsonPath : string
};

export default function CourseView({ lessons, jsonPath }: Props) {
    const [openLesson, setOpenLesson] = useState<number | null>(null);

    const toggleLesson = (id: number) => {
        setOpenLesson(openLesson === id ? null : id);
    };

    return (
        <div className="flex flex-col gap-4">
            {lessons.map((lesson) => (
                <div key={lesson.id} className="border rounded-lg">
                    {/* Header */}
                    <button
                        onClick={() => toggleLesson(lesson.id)}
                        className="w-full flex items-center justify-between px-4 py-3 font-medium hover:bg-gray-50"
                    >
                        <span>{lesson.name}</span>
                        {openLesson === lesson.id ? (
                            <ChevronDown className="w-5 h-5" />
                        ) : (
                            <ChevronRight className="w-5 h-5" />
                        )}
                    </button>

                    {/* Nội dung (videos) */}
                    {openLesson === lesson.id && (
                        <div className="p-4 border-t">
                            <ListVideoView 
                            videos={lesson.videos} 
                            jsonPath={jsonPath}
                        />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}



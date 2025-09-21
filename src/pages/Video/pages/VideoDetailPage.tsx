import { useState } from "react";
import CourseView from "../components/CourseView";
import SearchBar from "../components/SearchBar";
import { Section } from "../types/Video";
import { useCourse } from "../hooks/useVideo";

const JSON_PATH = "/home/mintori/.config/mintori/course/laravel.json";

export default function VideoDetailPage() {
  const [search, setSearch] = useState("");
  const { course, loading, error } = useCourse(JSON_PATH);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!course) return <div>Không có dữ liệu</div>;


  // Lọc video theo search
  const filteredSections: Section[] = course.sections
    .map((section) => ({
      ...section,
      videos: section.videos.filter((video) =>
        video.title.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((section) => section.videos.length > 0);

  if (!course) {
    return <div className="p-6">Đang tải dữ liệu...</div>;
  }

  // // Filter trong sections
  // const filteredSections: Section[] = course.sections
  //   .map((section) => ({
  //     ...section,
  //     videos: section.videos.filter((video) =>
  //       video.title.toLowerCase().includes(search.toLowerCase())
  //     ),
  //   }))
  //   .filter((section) => section.videos.length > 0);

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-xl font-bold mb-4">{course.course}</h1>

      {/* Ô tìm kiếm */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Tìm video ..."
      />

      {/* Danh sách section + video */}
      <CourseView 
        lessons={filteredSections} 
        jsonPath="/home/mintori/.config/mintori/course/laravel.json"
      />
    </div>
  );
}

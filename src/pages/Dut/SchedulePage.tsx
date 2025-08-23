import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import removeSVMainMenu from "./components/removeElement";
import Spinner from "../../components/common/Spinner";
import parseSemesters, { SelectType } from "./hooks/useSemesters";
import SemesterList from "./components/SemesterList";
import { Course, Examination } from "../../types/Course";
import { Button } from "../../components/ui/button";
import { selectDirectory } from "../../utils/selectDiretory";
import { Calendar } from "lucide-react";
import { CourseTable } from "./components/CourseTable";
import { ExaminationTable } from "./components/ExamTable";
import { parseStudySchedule } from "./utils/parseStudySchedule";
import { parseExamSchedule } from "./utils/parseExamSchedule";

// ---------------- Page Component ----------------
export default function SchedulePage() {
  const [studySchedule, setStudySchedule] = useState<Course[]>([]);
  const [examSchedule, setExamSchedule] = useState<Examination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [semesters, setSemesters] = useState<SelectType[]>([]);

  const generateCookie = async () => {
    try {
      await invoke("create_new_cookie");
    } catch (err) {
      console.error("❌ Failed to generate cookie:", err);
    }
  };

  const init = async () => {
    try {
      setIsLoading(true);
      const htmlRaw = await invoke<string>("fetch_schedule");

      const parsedSemesters = parseSemesters(htmlRaw);
      setSemesters(parsedSemesters);

      const cleanHtml = removeSVMainMenu(htmlRaw);
      setStudySchedule(parseStudySchedule(cleanHtml));
      setExamSchedule(parseExamSchedule(cleanHtml));

      setRetryCount(0);
    } catch (err) {
      if (retryCount < 1) {
        console.warn("⚠️ Retry due to error:", err);
        setRetryCount((prev) => prev + 1);
        await generateCookie();
        await init();
      } else {
        console.error("❌ Failed after retry:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScheduleById = async (id: string) => {
    try {
      setIsLoading(true);
      const htmlRaw = await invoke<string>("fetch_schedule_by_id", { id });
      const cleanHtml = removeSVMainMenu(htmlRaw);
      setStudySchedule(parseStudySchedule(cleanHtml));
      setExamSchedule(parseExamSchedule(cleanHtml));
    } catch (error) {
      console.error("❌ Failed to fetch schedule by ID:", error);
      setStudySchedule([]);
      setExamSchedule([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToICS = async () => {
    try {
      setIsLoading(true);
      const path = await selectDirectory();
      if (!path) {
        console.log("No path selected");
        return;
      }

      const payload = { courses: studySchedule, path };
      await invoke("convert_schedule_to_ics", { payload });
      alert("Successfully exported ICS");
    } catch (error) {
      console.error("Error exporting ICS:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const selected = semesters?.find((s) => s.selected);
    if (selected?.value) {
      fetchScheduleById(selected.value);
    }
  }, [semesters]);

  return isLoading ? (
    <Spinner />
  ) : (
    <div className="w-full font-sans bg-white">
      <h2 className="font-bold text-2xl flex items-center gap-2">
        <Calendar className="w-6 h-6 text-blue-500" />
        Lịch học, lịch thi cuối kỳ, lịch khảo sát ý kiến
      </h2>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
        <SemesterList semesters={semesters ?? []} setSemesters={setSemesters} />
        <Button variant="outline" onClick={handleExportToICS}>
          Xuất file .ICS
        </Button>
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-lg mb-2">📘 Lịch học</h3>
        <CourseTable courses={studySchedule} />

        <h3 className="font-bold text-lg mt-6 mb-2">📝 Lịch thi</h3>
        <ExaminationTable exams={examSchedule} />
      </div>
    </div>
  );
}

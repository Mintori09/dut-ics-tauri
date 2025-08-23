import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import Spinner from "../../components/common/Spinner";
import CourseResultsTable from "./components/CourseResultsTable";
import AcademicResultsTable from "./components/AcademicResultsTable";
import { AcademicResult, CourseResult } from "../../types/Score";
import removeSVMainMenu from "./components/removeElement";
import { parseCourseResults } from "./utils/parseCourseResults";
import { parseAcademicResults } from "./utils/parseAcademicResult";

export default function ScorePage() {
  const [courseResults, setCourseResults] = useState<CourseResult[]>([]);
  const [academicResults, setAcademicResults] = useState<AcademicResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);

  const init = async () => {
    try {
      setIsLoading(true);

      const htmlRaw = await invoke<string>("fetch_score");
      const cleanHtml = removeSVMainMenu(htmlRaw);

      setCourseResults(parseCourseResults(cleanHtml));
      setAcademicResults(parseAcademicResults(cleanHtml));
    } catch (err: any) {
      if (retryCount < 1) {
        console.warn("⚠️ Retry due to error:", err);
        setRetryCount(retryCount + 1);
        await invoke("create_new_cookie");
        await init();
      } else {
        console.error("❌ Failed after retry:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="p-4 font-sans">
      <h2 className="font-bold text-2xl mb-4">Kết quả học tập</h2>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <CourseResultsTable data={courseResults} />
          <AcademicResultsTable data={academicResults} />
        </>
      )}
    </div>
  );
}

import "./SchedulePage.css";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import removeSVMainMenu from "./components/removeElement";
import Spinner from "../../components/common/Spinner";
import parseSemesters, { SelectType } from "./hooks/useSemesters"; // Đổi tên nếu không phải hook
import SemesterList from "./components/SemesterList";
import { Course, tableToJson } from "../../types/Course";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "../../components/ui/button";

type Props = {
  courses: Course[];
  path: string;
};

export default function SchedulePage() {
  const [html, setHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [semesters, setSemesters] = useState<SelectType[] | undefined>(
    undefined,
  );

  async function selectDirectory(): Promise<string | undefined> {
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
      setHtml(cleanHtml);
      setRetryCount(0);
    } catch (err) {
      if (retryCount < 1) {
        console.warn("⚠️ Retry due to error:", err);
        setRetryCount((prev) => prev + 1);
        await generateCookie();
        await init();
      } else {
        console.error("❌ Failed after retry:", err);
        setHtml(
          "<p style='color:red'>❌ Failed to fetch HTML content after retry.</p>",
        );
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
      setHtml(cleanHtml);
    } catch (error) {
      console.error("❌ Failed to fetch schedule by ID:", error);
      setHtml(
        "<p style='color:red'>❌ Failed to fetch schedule for selected semester.</p>",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToICS = async () => {
    try {
      setIsLoading(true);
      console.log("mint");

      const courses: Course[] = tableToJson();
      const path = await selectDirectory();

      if (!path) {
        console.log("No path selected");
        return;
      }

      const payload: Props = {
        courses,
        path,
      };
      console.log(courses);

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
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2 className="font-bold text-2xl">
        Lịch học, lịch thi cuối kỳ, lịch khảo sát ý kiến
      </h2>
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
        <SemesterList semesters={semesters ?? []} setSemesters={setSemesters} />
        <Button variant="outline" color="inherit" onClick={handleExportToICS}>
          Xuất file .ICS
        </Button>
      </div>
      <div
        style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

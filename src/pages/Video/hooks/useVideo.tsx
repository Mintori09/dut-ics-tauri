import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Course } from "../types/Video";

export function useCourse(jsonPath: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<Course>("read_videos", { jsonPath });
      setCourse(result);
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  }, [jsonPath]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  return { course, loading, error, reload: loadCourse };
}

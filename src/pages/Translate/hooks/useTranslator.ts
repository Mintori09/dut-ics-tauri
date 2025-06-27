import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { basename, dirname } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { TranslateInput, TranslateOutput } from "../types/TranslateInput";

export function useTranslator() {
  const [files, setFiles] = useState<TranslateOutput[]>([]);
  const [fromLang, setFromLang] = useState("vi");
  const [toLang, setToLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const unlisten = listen<TranslateOutput>("file-translated", (event) => {
      const updated = event.payload;

      setFiles((prev) => {
        const remaining = prev.filter(
          (f) =>
            f.translate_input.input_path !== updated.translate_input.input_path,
        );
        return [updated, ...remaining];
      });

      setCompletedCount((count) => count + 1);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    if (loading && completedCount === files.length && files.length > 0) {
      setLoading(false);
      setCompletedCount(0);
    }
  }, [completedCount, files.length, loading]);

  const handleSelectFiles = async () => {
    const selected = await open({
      multiple: true,
      filters: [{ name: "Text or Subtitle", extensions: ["srt", "txt", "md"] }],
    });
    if (!selected) return;

    const paths = Array.isArray(selected) ? selected : [selected];
    const translateOutputs: TranslateOutput[] = await Promise.all(
      paths.map(async (path) => {
        const name = await basename(path);
        const dir = await dirname(path);
        const output_path = `${dir}/${name.replace(
          /\.(srt|txt|md)$/,
          "_translated.$1",
        )}`;
        return {
          translate_input: {
            input_path: path,
            output_path,
            from: fromLang,
            to: toLang,
          },
          is_translated: false,
        };
      }),
    );

    setFiles(translateOutputs);
    setCompletedCount(0);
  };

  const handleTranslate = async () => {
    if (files.length === 0) return;
    setCompletedCount(0);
    setLoading(true);
    try {
      const inputs: TranslateInput[] = files.map((f) => f.translate_input);
      await invoke("translate_stream_command", {
        batch: inputs,
      });
    } catch (err) {
      console.error("❌ Lỗi khi gọi dịch:", err);
      setLoading(false);
    }
  };

  return {
    files,
    fromLang,
    toLang,
    loading,
    setFromLang,
    setToLang,
    handleSelectFiles,
    handleTranslate,
  };
}

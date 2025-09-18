// src/pages/Picture/hooks/useDownload.ts
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { useState } from "react";

export type ZipItemResult = {
    url: string;
    file_name: string;
    ok: boolean;
    error?: string | null;
};

export function useDownload(selectedMap: Record<string, boolean>) {
    const [isDownloading, setIsDownloading] = useState(false);

    async function download(): Promise<{
        destPath?: string;
        results?: ZipItemResult[];
        error?: string;
    }> {
        const urls = Object.entries(selectedMap)
            .filter(([, v]) => v)
            .map(([url]) => url);

        if (urls.length === 0) {
            return { error: "No images selected" };
        }

        const ts = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);

        // Đừng đặt biến tên 'save' để tránh shadow với hàm save()
        const destPath = await save({
            title: "Save images as ZIP",
            filters: [{ name: "ZIP archive", extensions: ["zip"] }],
            defaultPath: `images-${ts}.zip`,
        });

        if (!destPath || typeof destPath !== "string") {
            // user cancel
            return {};
        }

        setIsDownloading(true);
        try {
            // Khai báo generic cho invoke để results có type rõ ràng
            const results = await invoke<ZipItemResult[]>("zip_images", {
                urls,
                destPath: destPath, // phải trùng tên tham số Rust
            });

            // Ví dụ: nếu bạn vẫn muốn alert đơn giản:
            const ok = results.filter((r: ZipItemResult) => r.ok).length;
            const fail = results.length - ok;
            if (ok > 0) {
                // eslint-disable-next-line no-alert
                alert(`✅ Zipped ${ok}/${results.length} images to:\n${destPath}`);
            }
            if (fail > 0) {
                const sample = results.filter((r: ZipItemResult) => !r.ok).slice(0, 5);
                const details = sample
                    .map(
                        (r: ZipItemResult) =>
                            `- ${r.file_name || r.url} → ${r.error || "unknown error"}`
                    )
                    .join("\n");
                // eslint-disable-next-line no-alert
                alert(`⚠️ ${fail} failed.\n${details}${fail > 5 ? "\n..." : ""}`);
            }

            return { destPath, results };
        } catch (e: unknown) {
            const msg =
                e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
            // eslint-disable-next-line no-alert
            alert(`❌ ZIP failed: ${msg}`);
            return { destPath, error: msg };
        } finally {
            setIsDownloading(false);
        }
    }

    return { isDownloading, download };
}



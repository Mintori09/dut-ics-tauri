// src/pages/Picture/hooks/useDownload.ts
import { invoke } from "@tauri-apps/api/core";
import { downloadDir, join } from "@tauri-apps/api/path";
import { save } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

export type ZipItemResult = {
    url: string;
    file_name: string;
    ok: boolean;
    error?: string | null;
};

export function useZip(selectedMap: Record<string, boolean>) {
    const [isDownloading, setIsDownloading] = useState(false);
    useEffect(() => {
        const permission = async () => {
            let permissionGranted = await isPermissionGranted();
            if (!permissionGranted) {
                const permission = await requestPermission();
                permissionGranted = permission === 'granted';
            }
        }
        permission()
    }, [])

    async function download() {
        const urls = Object.entries(selectedMap)
            .filter(([, v]) => v)
            .map(([url]) => url);
        if (urls.length === 0) return { error: "No images selected" };

        const ts = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);

        const destPath = await save({
            title: "Save images as ZIP",
            filters: [{ name: "ZIP archive", extensions: ["zip"] }],
            defaultPath: `images-${ts}.zip`,
        });
        if (!destPath || typeof destPath !== "string") return {}; // user cancelled

        setIsDownloading(true);
        try {
            const results = await invoke<ZipItemResult[]>("zip_images", {
                urls,
                destPath,
            });
            return { destPath, results };
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            return { destPath, error: msg };
        } finally {
            setIsDownloading(false);
        }
    }

    return { isDownloading, download };
}

export function useDownload(selectedMap: Record<string, boolean>) {
    const [isDownloading, setIsDownloading] = useState(false);

    async function download() {
        const urls = Object.entries(selectedMap)
            .filter(([, v]) => v)
            .map(([url]) => url);

        if (urls.length === 0) {
            return { error: "No images selected" };
        }

        const ts = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
        const folderName = ts + '-' + sanitizeFolderName(urls[0]);
        const downloads = await downloadDir();
        const baseDir = await join(downloads, "mintori-download");
        const destDir = await join(baseDir, folderName);

        setIsDownloading(true);
        try {
            const results = await invoke<ZipItemResult[]>("download_images", {
                urls,
                destDir,
            });
            const message = "Download thành công\n" + destDir;

            sendNotification({ title: 'Mintori', body: message });

            return { destDir, results };
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            return { destDir, error: msg };
        } finally {
            setIsDownloading(false);
        }
    }

    return { isDownloading, download };
}

function sanitizeFolderName(input: string): string {
    return input
        .replace(/(^\w+:|^)\/\//, "") // strip protocol
        .replace(/[\/\\:?*"<>|]/g, "_") // replace illegal characters
        .slice(0, 50); // keep folder names reasonable length
}

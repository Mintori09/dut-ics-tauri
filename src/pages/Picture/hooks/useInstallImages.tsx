// src/lib/onScrape.ts
import { invoke } from "@tauri-apps/api/core";
import type { ImgItem } from "../types/ImgItem";

// tiny helpers
function uniqueByUrl<T extends { url: string }>(list: T[]): T[] {
    const seen = new Set<string>();
    return list.filter(i => (seen.has(i.url) ? false : (seen.add(i.url), true)));
}

function normalizeHttp(u: string): string | null {
    const s = u.trim();
    if (!/^https?:\/\//i.test(s)) return null;
    try {
        return new URL(s).toString(); // normalize
    } catch {
        return null;
    }
}

/**
 * Calls the Tauri command `scrape_images` and updates UI state.
 * Assumes backend returns: Array<{ url: string }>
 */
export async function onScrape(
    url: string,
    setImages: (list: ImgItem[]) => void,
    setLoading?: (b: boolean) => void,
    setError?: (msg: string | null) => void,
    setProgress?: (n: number) => void // optional progress UI hook
) {
    setError?.(null);
    setLoading?.(true);
    setProgress?.(10);

    try {
        // 1) basic input check
        try {
            new URL(url);
        } catch {
            throw new Error("URL không hợp lệ.");
        }

        setProgress?.(30);

        // 2) invoke backend; type the response directly to avoid `unknown`
        const raw = await invoke<{ url: string }[]>("scrape_images", { target: url });

        setProgress?.(70);

        // 3) minimal runtime hygiene (no zod):
        //    - ensure it's an array
        //    - keep items that have a url string
        //    - normalize & filter to http(s)
        const arr = Array.isArray(raw) ? raw : [];
        const cleaned = uniqueByUrl(
            arr
                .filter(x => x && typeof x.url === "string")
                .map(x => {
                    const normalized = normalizeHttp(x.url);
                    return normalized ? { url: normalized } : null;
                })
                .filter((x): x is { url: string } => x !== null)
        );

        // 4) map to your UI's ImgItem shape
        //    You currently have { url, w?, h?, type? }. Backend returns only url.
        const uiItems: ImgItem[] = cleaned.map(x => ({
            url: x.url,
            w: undefined,
            h: undefined,
            type: undefined,
        }));

        setImages(uiItems);
        setProgress?.(100);
    } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Có lỗi xảy ra.";
        setError?.(msg);
    } finally {
        setLoading?.(false);
        // let the progress bar linger a bit, caller can reset to 0 later if desired
    }
}



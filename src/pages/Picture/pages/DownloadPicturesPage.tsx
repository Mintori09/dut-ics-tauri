import { useEffect, useMemo, useState } from "react";
import { useFullScreenURLDrop } from "../components/UseFullScreenURLDrop";
import { DropURLOverlay } from "../components/DropUrlOverlay";
import { ResultsSection } from "../components/ResultsSection";
import { ImgItem } from "../types/ImgItem";
import { HeaderBar } from "../components/HeaderBar";
import { onScrape } from "../hooks/useInstallImages";
import { useDownload } from "../hooks/useDownload";


// ===================== Demo Data =====================
const DEMO_IMAGES: ImgItem[] = Array.from({ length: 24 }).map((_, i) => ({
    url: `https://picsum.photos/seed/demo-${i}/600/400`,
    w: 600,
    h: 400,
    type: "image/jpeg",
}));

// =====================================================
// Component: Empty hint
// =====================================================
function EmptyHint() {
    return (
        <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
            Chưa có ảnh nào. Kéo-thả URL vào bất kỳ đâu trên màn hình hoặc nhập ở trên rồi bấm <b>Lấy ảnh</b> để xem giao diện mô phỏng kết quả.
        </div>
    );
}

// =====================================================
// Page: DownloadPicturesPage
// =====================================================
export default function DownloadPicturesPage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [images, setImages] = useState<ImgItem[]>([]);
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const { isDownloading, download } = useDownload(selected);

    // Fullscreen URL drop
    const { active, preview } = useFullScreenURLDrop((u) => setUrl(u));

    // Paste support
    useEffect(() => {
        function onPaste(e: ClipboardEvent) {
            const text = e.clipboardData?.getData("text/plain");
            if (text && /^https?:\/\//i.test(text.trim())) setUrl(text.trim());
        }
        window.addEventListener("paste", onPaste);
        return () => window.removeEventListener("paste", onPaste);
    }, []);

    // REAL scrape using Tauri command
    async function scrape() {
        setImages([]);
        setSelected({});
        setProgress(0);
        await onScrape(url, setImages, setLoading, setError, setProgress);
        // after setImages, preselect all (or none — up to you)
        setSelected((prev) => {
            const next: Record<string, boolean> = {};
            for (const img of images) next[img.url] = true;
            return next;
        });
        // optional: smooth reset progress after a moment
        setTimeout(() => setProgress(0), 600);
    }

    // If you want an error toast/box:
    const [error, setError] = useState<string | null>(null);

    // ... keep the rest of your component the same,
    // just pass `onScrape={scrape}` into HeaderBar.
    return (
        <main className="container mx-auto p-6 max-w-6xl relative">
            <DropURLOverlay active={active} preview={preview} />

            <HeaderBar
                url={url}
                setUrl={setUrl}
                loading={loading}
                progress={progress}
                onScrape={scrape} // <— use the real scraper
                onClear={() => {
                    setUrl("");
                    setImages([]);
                    setSelected({});
                    setError(null);
                    setProgress(0);
                }}
            />

            {error && (
                <div className="border rounded-md p-3 my-2 text-red-700 bg-red-50">
                    {error}
                </div>
            )}

            {images.length > 0 ? (
                <ResultsSection
                    images={images}
                    selectedCount={Object.values(selected).filter(Boolean).length}
                    selectedMap={selected}
                    setSelectedMap={setSelected}
                    onDownload={download}
                />
            ) : (
                <EmptyHint />
            )}
        </main>
    );
}

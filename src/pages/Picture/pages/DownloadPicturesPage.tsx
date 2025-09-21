import { useEffect, useState } from "react";
import { useFullScreenURLDrop } from "../components/UseFullScreenURLDrop";
import { DropURLOverlay } from "../components/DropUrlOverlay";
import { ResultsSection } from "../components/ResultsSection";
import { ImgItem } from "../types/ImgItem";
import { HeaderBar } from "../components/HeaderBar";
import { onScrape } from "../hooks/useInstallImages";
import { EmptyHint } from "../components/EmptyHint";
import { useDownload, useZip } from "../hooks/useDownload";
import Spinner from "../../../components/common/Spinner";

export default function DownloadPicturesPage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [images, setImages] = useState<ImgItem[]>([]);
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const { isDownloading: isDownloading, download: handleDownload } = useDownload(selected);
    const { isDownloading: isZipping, download: handleZip } = useZip(selected);

    const { active, preview } = useFullScreenURLDrop((u) => setUrl(u));

    useEffect(() => {
        function onPaste(e: ClipboardEvent) {
            const text = e.clipboardData?.getData("text/plain");
            if (text && /^https?:\/\//i.test(text.trim())) setUrl(text.trim());
        }
        window.addEventListener("paste", onPaste);
        return () => window.removeEventListener("paste", onPaste);
    }, []);

    async function scrape() {
        setImages([]);
        setSelected({});
        setProgress(0);
        await onScrape(url, setImages, setLoading, setError, setProgress);

        setSelected(() => {
            const next: Record<string, boolean> = {};
            for (const img of images) next[img.url] = true;
            return next;
        });

        setTimeout(() => setProgress(0), 600);
    }

    const [error, setError] = useState<string | null>(null);

    return (
        <main className="container mx-auto p-6 max-w-6xl relative">
            <DropURLOverlay active={active} preview={preview} />

            <HeaderBar
                url={url}
                setUrl={setUrl}
                loading={loading}
                progress={progress}
                onScrape={scrape}
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

            {
                (isDownloading || isZipping) ? (
                    <Spinner />
                ) : (
                    images.length > 0 ? (
                        <ResultsSection
                            images={images}
                            selectedCount={Object.values(selected).filter(Boolean).length}
                            selectedMap={selected}
                            setSelectedMap={setSelected}
                            onDownload={handleDownload}
                            onZip={handleZip}
                        />
                    ) : (
                        <EmptyHint />
                    )
                )
            }
        </main>
    );
}

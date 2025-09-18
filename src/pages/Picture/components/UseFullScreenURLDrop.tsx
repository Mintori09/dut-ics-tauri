import { useCallback, useEffect, useRef, useState } from "react";

function extractURLFromHTML(html: string): string | null {
    // bắt <a href="..."> hoặc plaintext http(s)
    const a = html.match(/href=["'](https?:\/\/[^"']+)["']/i)?.[1];
    if (a) return a;
    const t = html.match(/(https?:\/\/[^\s"'<>]+)/i)?.[1];
    return t ?? null;
}

function peekURL(dt: DataTransfer | null | undefined): string | null {
    if (!dt) return null;
    const uri = dt.getData("text/uri-list") || dt.getData("text/plain");
    if (uri && /^https?:\/\//i.test(uri.trim())) return uri.trim();

    const html = dt.getData("text/html");
    const fromHtml = html ? extractURLFromHTML(html) : null;
    if (fromHtml) return fromHtml.trim();

    return null;
}

export function useFullScreenURLDrop(onURL: (url: string) => void) {
    const [active, setActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const dragDepth = useRef(0);

    const reset = useCallback(() => {
        dragDepth.current = 0;
        setActive(false);
        setPreview(null);
    }, []);

    useEffect(() => {
        function onDragEnter(e: DragEvent) {
            dragDepth.current++;
            setActive(true); // luôn mở overlay để chặn điều hướng mặc định
            const u = peekURL(e.dataTransfer);
            if (u) setPreview(u);
        }

        function onDragOver(e: DragEvent) {
            // CHÌA KHÓA: phải preventDefault để cho phép drop (và chặn điều hướng)
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
            const u = peekURL(e.dataTransfer);
            if (u) setPreview(u);
        }

        function onDragLeave() {
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) reset();
        }

        function onDrop(e: DragEvent) {
            e.preventDefault(); // chặn mở tab mới với URL được thả
            const u = peekURL(e.dataTransfer);
            if (u) onURL(u);
            reset();
        }

        function onDragEnd() {
            reset();
        }

        // GẮN trên window để bắt toàn màn hình
        window.addEventListener("dragenter", onDragEnter);
        window.addEventListener("dragover", onDragOver);
        window.addEventListener("dragleave", onDragLeave);
        window.addEventListener("drop", onDrop);
        window.addEventListener("dragend", onDragEnd);
        window.addEventListener("mouseleave", onDragEnd as any);

        return () => {
            window.removeEventListener("dragenter", onDragEnter);
            window.removeEventListener("dragover", onDragOver);
            window.removeEventListener("dragleave", onDragLeave);
            window.removeEventListener("drop", onDrop);
            window.removeEventListener("dragend", onDragEnd);
            window.removeEventListener("mouseleave", onDragEnd as any);
        };
    }, [onURL, reset]);

    return { active, preview } as const;
}



import { MousePointer } from "lucide-react";

export function DropURLOverlay({ active, preview }: { active: boolean; preview: string | null }) {
    if (!active) return null;
    const host = (() => {
        try { return preview ? new URL(preview).host : ""; } catch { return ""; }
    })();

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 backdrop-blur-sm border-2 border-dashed border-primary"
            // Safari/WebKit cần preventDefault tại chính overlay (phòng khi sự kiện không nổi lên window)
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
        >
            <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card/80 p-6 shadow-xl">
                <MousePointer className="h-8 w-8" />
                <p className="text-sm text-muted-foreground">Thả URL vào bất kỳ đâu để dán nhanh</p>
                {preview ? <div className="text-xs text-muted-foreground">{host || preview}</div> : null}
            </div>
        </div>
    );
}

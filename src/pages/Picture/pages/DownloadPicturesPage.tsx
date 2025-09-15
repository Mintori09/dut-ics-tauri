import { useEffect, useMemo, useState } from "react"
import {
    Loader2,
    Image as ImageIcon,
    Download,
    Eye,
    CheckSquare,
    Square,
    Trash2,
    Link2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { Checkbox } from "@radix-ui/react-checkbox"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Dialog } from "@radix-ui/react-dialog"
import { DialogContent, DialogTrigger } from "../../../components/ui/dialog"
import { Badge } from "../../../components/ui/badge"
import { listen } from '@tauri-apps/api/event'


type ImgItem = {
    url: string
    w?: number
    h?: number
    type?: string
}

// mock ảnh demo (picsum)
const DEMO_IMAGES: ImgItem[] = Array.from({ length: 24 }).map((_, i) => ({
    url: `https://picsum.photos/seed/demo-${i}/600/400`,
    w: 600,
    h: 400,
    type: "image/jpeg",
}))

export default function DownloadPicturesPage() {

    const [url, setUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [images, setImages] = useState<ImgItem[]>([])
    const [selected, setSelected] = useState<Record<string, boolean>>({})
    const [preview, setPreview] = useState<string | null>(null)
    const [downloading, setDownloading] = useState(false)

    const selectedCount = useMemo(
        () => Object.values(selected).filter(Boolean).length,
        [selected]
    )

    useEffect(() => {
        function onDragOver(e: DragEvent) { e.preventDefault(); }
        function onDrop(e: DragEvent) {
            e.preventDefault();
            const dt = e.dataTransfer;
            if (!dt) return;
            // Ưu tiên chuẩn URL list
            const uri = dt.getData('text/uri-list') || dt.getData('text/plain');
            if (uri) setUrl(uri.trim());
        }
        window.addEventListener('dragover', onDragOver);
        window.addEventListener('drop', onDrop);
        return () => {
            window.removeEventListener('dragover', onDragOver);
            window.removeEventListener('drop', onDrop);
        };
    }, []);
    // UI-only: mô phỏng “Lấy ảnh”
    async function scrapeMock() {
        setLoading(true)
        setImages([])
        setSelected({})
        setProgress(12)

        // mô phỏng tiến độ
        const t1 = setTimeout(() => setProgress(42), 350)
        const t2 = setTimeout(() => setProgress(76), 850)

        await new Promise((r) => setTimeout(r, 1200))
        clearTimeout(t1)
        clearTimeout(t2)

        // đưa ảnh demo
        setImages(DEMO_IMAGES)
        const init: Record<string, boolean> = {}
        DEMO_IMAGES.forEach((img) => (init[img.url] = true))
        setSelected(init)

        setProgress(100)
        setLoading(false)
        setTimeout(() => setProgress(0), 600) // trả progress về 0 sau chút
    }

    function toggleAll(val: boolean) {
        const next: Record<string, boolean> = {}
        images.forEach((i) => (next[i.url] = val))
        setSelected(next)
    }

    // UI-only: mô phỏng “Tải ZIP”
    async function downloadMock() {
        if (selectedCount === 0) return
        setDownloading(true)
        await new Promise((r) => setTimeout(r, 800))
        setDownloading(false)
        alert(`(UI-only) Sẵn sàng tải ${selectedCount} ảnh dưới dạng ZIP.`)
    }

    return (
        <main className="container mx-auto p-6 max-w-6xl">
            {/* Header Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Download tất cả hình ảnh từ URL
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="flex-1 flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Dán URL tại đây (ví dụ: https://example.com/bai-viet)"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && url && !loading && scrapeMock()}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={scrapeMock}
                                disabled={!url || loading}
                                className="whitespace-nowrap"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lấy ảnh"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setUrl("")
                                    setImages([])
                                    setSelected({})
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xoá
                            </Button>
                        </div>
                    </div>

                    {loading || progress > 0 ? (
                        <div className="space-y-2">
                            <progress value={progress} />
                            <p className="text-xs text-muted-foreground">
                                {progress < 100 ? "Đang quét & gom ảnh (mô phỏng)..." : "Hoàn tất."}
                            </p>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {/* Results */}
            {images.length > 0 ? (
                <Card>
                    <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base md:text-lg">
                                Tìm thấy <b>{images.length}</b> ảnh
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{selectedCount} đã chọn</Badge>
                                {/* <Spnpm dlx shadcn@latest add separatoreparator orientation="vertical" className="h-6" /> */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleAll(true)}
                                    className="hidden sm:inline-flex"
                                >
                                    <CheckSquare className="h-4 w-4 mr-2" />
                                    Chọn tất cả
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleAll(false)}
                                    className="hidden sm:inline-flex"
                                >
                                    <Square className="h-4 w-4 mr-2" />
                                    Bỏ chọn
                                </Button>
                                <Button onClick={downloadMock} disabled={downloading || selectedCount === 0}>
                                    {downloading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4 mr-2" />
                                    )}
                                    Tải ZIP
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-2 sm:hidden">
                            {/* Nút nhỏ cho mobile */}
                            <Button variant="outline" size="sm" onClick={() => toggleAll(true)} className="flex-1">
                                Chọn tất cả
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toggleAll(false)} className="flex-1">
                                Bỏ chọn
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <ScrollArea className="h-[70vh]">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {images.map((img) => (
                                    <figure
                                        key={img.url}
                                        className="group relative border rounded-md overflow-hidden bg-muted/20"
                                    >
                                        <img
                                            src={img.url}
                                            alt=""
                                            className="w-full h-40 object-cover transition group-hover:scale-[1.02]"
                                            loading="lazy"
                                        />

                                        {/* Checkbox overlay */}
                                        <figcaption className="absolute top-2 left-2">
                                            <label className="inline-flex items-center gap-2 rounded-md bg-black/55 backdrop-blur px-2 py-1 text-white text-xs">
                                                <Checkbox
                                                    checked={!!selected[img.url]}
                                                    onCheckedChange={(v) =>
                                                        setSelected((s) => ({ ...s, [img.url]: Boolean(v) }))
                                                    }
                                                    className="border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                                                />
                                                Chọn
                                            </label>
                                        </figcaption>

                                        {/* Preview button */}
                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="secondary" onClick={() => setPreview(img.url)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Xem
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl p-0 overflow-hidden">
                                                    <img src={preview ?? img.url} alt="" className="w-full h-auto" />
                                                    <div className="p-3 text-xs text-muted-foreground flex justify-between">
                                                        <span className="truncate">{img.url}</span>
                                                        <span>
                                                            {img.w}×{img.h}{img.type ? ` • ${img.type}` : ""}
                                                        </span>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </figure>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            ) : (
                <EmptyHint />
            )}
        </main>
    )
}

function EmptyHint() {
    return (
        <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
            Chưa có ảnh nào. Nhập một URL ở trên và bấm <b>Lấy ảnh</b> để xem giao diện mô phỏng kết quả.
        </div>
    )
}

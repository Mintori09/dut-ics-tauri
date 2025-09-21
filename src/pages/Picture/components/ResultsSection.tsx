import { CheckSquare, Download, Square } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ImgItem } from "../types/ImgItem";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogTitle
} from "../../../components/ui/dialog";
import { ImageCard } from "./ImageCard";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
    images: ImgItem[];
    selectedCount: number;
    selectedMap: Record<string, boolean>;
    setSelectedMap: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
    onDownload: () => void;
    onZip: () => void;
};

export function ResultsSection({
    images,
    selectedCount,
    selectedMap,
    setSelectedMap,
    onZip,
    onDownload,
}: Props) {
    const [openImageUrl, setOpenImageUrl] = useState<string | null>(null);

    const indexByUrl = useMemo(() => {
        const m = new Map<string, number>();
        images.forEach((img, i) => m.set(img.url, i));
        return m;
    }, [images]);

    const currentImg = useMemo(() => {
        if (!openImageUrl) return null;
        const i = indexByUrl.get(openImageUrl);
        return i == null ? null : images[i];
    }, [openImageUrl, indexByUrl, images]);

    useEffect(() => {
        if (openImageUrl && !indexByUrl.has(openImageUrl)) {
            setOpenImageUrl(null);
        }
    }, [openImageUrl, indexByUrl]);

    const go = useCallback(
        (dir: -1 | 1) => {
            if (!openImageUrl || images.length === 0) return;
            const idx = indexByUrl.get(openImageUrl);
            if (idx == null) return;
            const next = (idx + dir + images.length) % images.length;
            setOpenImageUrl(images[next].url);
        },
        [openImageUrl, images, indexByUrl]
    );

    const onDialogKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                go(1);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                go(-1);
            } else if (e.key === "Escape") {
                setOpenImageUrl(null);
            }
        },
        [go]
    );

    const toggleAll = useCallback(
        (val: boolean) => {
            setSelectedMap((prev) => {
                // Nếu tất cả đã đúng trạng thái mong muốn thì trả về prev để tránh re-render
                const allOk = images.every((i) => !!prev[i.url] === val);
                if (allOk) return prev;

                // Tạo next dựa trên prev, chỉ cập nhật các ảnh đang hiển thị
                const next = { ...prev };
                for (const i of images) {
                    if (!!prev[i.url] !== val) next[i.url] = val;
                }
                return next;
            });
        },
        [images, setSelectedMap]
    );

    const toggleOne = useCallback(
        (url: string, v: boolean) => {
            setSelectedMap((prev) => (prev[url] === v ? prev : { ...prev, [url]: v }));
        },
        [setSelectedMap]
    );

    return (
        <Card>
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg">
                        Tìm thấy <b>{images.length}</b> ảnh
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{selectedCount} đã chọn</Badge>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAll(true)}
                            className="hidden sm:inline-flex"
                            aria-label="Chọn tất cả ảnh đang hiển thị"
                            type="button"
                        >
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Chọn tất cả
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAll(false)}
                            className="hidden sm:inline-flex"
                            aria-label="Bỏ chọn tất cả ảnh đang hiển thị"
                            type="button"
                        >
                            <Square className="h-4 w-4 mr-2" />
                            Bỏ chọn
                        </Button>

                        <Button onClick={onZip} disabled={selectedCount === 0} type="button">
                            <Download className="h-4 w-4 mr-2" />
                            Nén ZIP
                        </Button>

                        <Button onClick={onDownload} disabled={selectedCount === 0} type="button">
                            <Download className="h-4 w-4 mr-2" />
                            Tải file
                        </Button>
                    </div>
                </div>

                {/* Mobile bulk actions */}
                <div className="flex gap-2 sm:hidden">
                    <Button variant="outline" size="sm" onClick={() => toggleAll(true)} className="flex-1" type="button">
                        Chọn tất cả
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleAll(false)} className="flex-1" type="button">
                        Bỏ chọn
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-[70vh]">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((img) => {
                            const open = openImageUrl === img.url;
                            const checked = !!selectedMap[img.url];
                            return (
                                <div key={img.url}>
                                    <Dialog open={open} onOpenChange={(v) => setOpenImageUrl(v ? img.url : null)}>
                                        <ImageCard
                                            img={img}
                                            checked={checked}
                                            onToggle={(v: boolean) => toggleOne(img.url, v)}
                                            onOpen={() => setOpenImageUrl(img.url)}
                                        />

                                        <DialogContent
                                            className="rounded-2xl border p-0 !max-w-none w-screen h-screen sm:w-auto sm:h-auto sm:max-w-[96vw] sm:max-h-[96vh] "
                                            onKeyDown={onDialogKeyDown}
                                        >
                                            <DialogTitle className="sr-only">Xem trước ảnh</DialogTitle>

                                            <div className="relative w-full h-full sm:w-[96vw] sm:h-[96vh] rounded-2xl overflow-hidden">
                                                {/* vùng xem ảnh */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 ">
                                                    <img
                                                        src={currentImg?.url ?? img.url}
                                                        alt={
                                                            currentImg?.type
                                                                ? `Xem trước ảnh loại ${currentImg.type}`
                                                                : "Xem trước ảnh"
                                                        }
                                                        className="block mx-auto w-auto h-auto max-w-[96vw] max-h-[96vh] sm:max-w-[95vw] sm:max-h-[90vh] object-contain"
                                                        decoding="async"
                                                        draggable={false}
                                                    />
                                                </div>

                                                {/* overlay thông tin */}
                                                <div className="absolute bottom-0 left-0 right-0 p-3 text-xs text-black flex justify-between gap-3 bg-black/30">
                                                    <span
                                                        className="truncate font-semibold "
                                                        title={currentImg?.url ?? img.url}
                                                    >
                                                        {currentImg?.url ?? img.url}
                                                    </span>
                                                    <span className="font-semibold ">
                                                        {(currentImg?.w ?? img.w)}×{currentImg?.h ?? img.h}
                                                        {(currentImg?.type ?? img.type) ? ` • ${currentImg?.type ?? img.type}` : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}



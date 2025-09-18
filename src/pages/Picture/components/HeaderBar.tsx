import { Image as ImageIcon, Link2, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

type Props = {
    url: string;
    setUrl: (v: string) => void;
    loading: boolean;
    progress: number;
    onScrape: () => void;
    onClear: () => void;
};

export function HeaderBar({ url, setUrl, loading, progress, onScrape, onClear }: Props) {
    return (
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
                            placeholder="Dán hoặc kéo-thả URL vào bất kỳ đâu (vd: https://example.com/bai-viet)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && url && !loading && onScrape()}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={onScrape} disabled={!url || loading} className="whitespace-nowrap">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lấy ảnh"}
                        </Button>
                        <Button variant="outline" onClick={onClear}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xoá
                        </Button>
                    </div>
                </div>
                {loading || progress > 0 ? (
                    <div className="space-y-2">
                        <progress value={progress} max={100} className="w-full" />
                        <p className="text-xs text-muted-foreground">
                            {progress < 100 ? "Đang quét & gom ảnh (mô phỏng)..." : "Hoàn tất."}
                        </p>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}



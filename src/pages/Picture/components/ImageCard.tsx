import { Checkbox } from "@radix-ui/react-checkbox";
import { ImgItem } from "../types/ImgItem";
import { Button } from "../../../components/ui/button";
import { Eye } from "lucide-react";

export function ImageCard({
    img,
    checked,
    onToggle,
    onOpen,
}: {
    img: ImgItem;
    checked: boolean;
    onToggle: (v: boolean) => void;
    onOpen: () => void;
}) {
    return (
        <figure
            className={`group relative rounded-md overflow-hidden bg-muted/20 transition ${checked ? "border-4 border-blue-500" : "border border-transparent"
                }`}
        >
            <img
                src={img.url}
                alt=""
                className="w-full h-40 object-cover transition group-hover:scale-[1.02]"
                loading="lazy"
            />
            <figcaption className="absolute top-2 left-2">
                <label className="inline-flex items-center gap-2 rounded-md bg-black/55 backdrop-blur px-2 py-1 text-white text-xs">
                    <Checkbox
                        checked={!!checked}
                        onCheckedChange={(v) => onToggle(Boolean(v))}
                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    Chọn
                </label>
            </figcaption>
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition">
                <Button size="sm" variant="secondary" onClick={onOpen}>
                    <Eye className="h-4 w-4 mr-2" />
                    Xem
                </Button>
            </div>
        </figure>
    );
}



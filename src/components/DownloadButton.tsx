import { useState } from "react"
import "../App.css"
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from "@tauri-apps/api/core";

type Props = {
    data: string
}


export default function Button({ data }: Props) {
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const [buttonContent, setButtonContent] = useState<string>("Lưu thành ICS")

    const handleClick = async () => {
        try {
            setIsProcessing(true);
            const dir = await open({ directory: true, multiple: false });
            if (dir && typeof dir === "string") {
                await invoke("from_markdown_to_ics", {
                    outputPath: dir,
                    data: data
                })
                setButtonContent("Lưu thành công!")
            } else {
                console.log("No directory selected");
            }
        } catch (e) {
            console.error("Failed to generate ICS: ", e);
        } finally {
            setIsProcessing(false)
        }
    }

    return <button className="btn" onClick={handleClick} disabled={isProcessing}>{isProcessing ? "Processing ..." : buttonContent}</button>
}

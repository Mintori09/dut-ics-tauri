import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import removeSVMainMenu from "./components/removeElement";
import Spinner from "../../components/common/Spinner"

export default function ScorePage() {
    const [html, setHtml] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [retryCount, setRetryCount] = useState(0);

    const init = async () => {
        try {
            setIsLoading(true);

            // Gọi Tauri backend
            const htmlRaw = await invoke<string>("fetch_score");

            // Làm sạch HTML
            const cleanHtml = removeSVMainMenu(htmlRaw);
            setHtml(cleanHtml);
        } catch (err: any) {
            if (retryCount < 1) {
                console.warn("⚠️ Retry due to error:", err);
                setRetryCount(retryCount + 1);
                await generateCookie();
                await init();
            } else {
                console.error("❌ Failed after retry:", err);
                setHtml("<p style='color:red'>❌ Failed to fetch HTML content after retry.</p>");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const generateCookie = async () => {
        await invoke("create_new_cookie");
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <div className="p-4 font-sans">
            < div style={{ display: "flex" }
            }>
                {/* <button onClick={init} style={{ marginTop: "1rem" }}> */}
                {/*     Reload */}
                {/* </button> */}
                {/* <button onClick={generateCookie} style={{ marginTop: "1rem" }}> */}
                {/*     Generate Cookie */}
                {/* </button> */}
            </div >
            {isLoading ? <Spinner />
                : <div
                    style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}
                    dangerouslySetInnerHTML={{ __html: html }}
                />}

        </div >
    );
}

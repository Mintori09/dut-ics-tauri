import { invoke } from "@tauri-apps/api/core";
import { BaseDirectory, readTextFile } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";

export default function ScorePage() {
    const [html, setHtml] = useState<string>("");

    const init = async () => {
        try {
            const fileContent = await readTextFile(".config/mintori/config.json", {
                baseDir: BaseDirectory.Home,
            });
            const json = JSON.parse(fileContent);
            const cookie = json.DutCookie ?? "";

            const html = await invoke<string>("fetch_dut", {
                cookie: cookie,
            });

            function removeSVMainMenu(html: string): string {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");

                // Xoá phần tử có id="SVMainMenu"
                const mainMenu = doc.getElementById("SVMainMenu");
                if (mainMenu) {
                    mainMenu.remove();
                }

                // Xoá tất cả phần tử có class="aspNetHidden"
                const hiddenElements = doc.getElementsByClassName("aspNetHidden");
                Array.from(hiddenElements).forEach((element) => {
                    element.remove();
                });

                const headerElements = doc.getElementsByClassName("pageHeader");
                Array.from(headerElements).forEach((element) => {
                    element.remove();
                });

                return doc.documentElement.outerHTML;
            }

            setHtml(removeSVMainMenu(html));
        } catch (err) {
            console.error("Error:", err);
            setHtml("<p style='color:red'>❌ Failed to fetch HTML content.</p>");
        }
    };

    const generateCookie = async () => {
        await invoke("create_new_cookie")
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>

            <div style={{ display: "flex" }}>
                <button onClick={init} style={{ marginTop: "1rem" }}>
                    Reload
                </button>
                <button onClick={generateCookie} style={{ marginTop: "1rem" }}>
                    Generate Cookie
                </button>
            </div>
            <div
                style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}
                dangerouslySetInnerHTML={{ __html: html }}
            />

        </div>
    );
}

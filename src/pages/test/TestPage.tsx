import { useEffect, useState } from "react";

const TestPage = () => {
    const [data, setData] = useState<string | null>(null);
    const [url, setUrl] = useState<string>("http://sv.dut.udn.vn/");

    useEffect(() => {
        if (!url) return;

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "*/*"
            },
            body: "",
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.text(); // hoặc response.json() nếu JSON
            })
            .then(text => {
                setData(text);
                console.log("Fetched data:", text);
            })
            .catch(err => {
                console.error("Fetch error:", err);
            });
    }, [url]);

    return (
        <div>
            <h2>Test Page</h2>
            <button onClick={() => setUrl("http://sv.dut.udn.vn/WebAjax/evLopHP_Load.aspx?E=CTRTBGV&PAGETB=2&COL=TieuDe&NAME=&TAB=1")}>
                Tải trang tiếp theo
            </button>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{data}</pre>
        </div>
    );
}

export default TestPage;

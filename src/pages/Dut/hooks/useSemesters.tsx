export interface SelectType {
    value: string;
    text: string;
    selected: boolean;
}

export default function useSemesters(htmlRaw: string): SelectType[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlRaw, "text/html");
    const select = doc.querySelector("select") as HTMLSelectElement | null;
    let selectId = "TTKB_cboHocKy"

    if (!select) {
        console.warn(`Không tìm thấy phần tử select với id "${selectId}"`);
        return [];
    }

    return Array.from(select.options)
        .filter((opt) => opt.value !== "")
        .map((opt) => ({
            value: opt.value,
            text: opt.textContent?.trim() ?? "",
            selected: opt.selected,
        }));
}



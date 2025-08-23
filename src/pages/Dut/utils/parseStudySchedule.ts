import { Course } from "../../../types/Course";
import { mapRawRowsToCourses } from "./mapRawRowsToCourses";

export function parseStudySchedule(html: string): Course[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const table = doc.getElementById("TTKB_GridInfo") as HTMLTableElement;

  if (!table) return [];

  const rows = Array.from(table.rows);
  const headerRow = rows.find(
    (row) =>
      row.classList.contains("GridHeader") &&
      row.querySelectorAll("th").length > 5,
  );

  const headers = [
    "tt",
    ...Array.from(headerRow!.cells).map((cell) =>
      cell.textContent!.trim().toLowerCase().replace(/\s+/g, "_"),
    ),
  ];

  const dataRows = rows.filter(
    (row) =>
      row.classList.contains("GridRow") && !row.classList.contains("kctHeader"),
  );

  const data: any[] = [];
  for (const row of dataRows) {
    const cells = Array.from(row.cells);
    const rowData: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      rowData[headers[i]] = cells[i]?.textContent?.trim() || "";
    }
    data.push(rowData);
  }

  return mapRawRowsToCourses(data);
}

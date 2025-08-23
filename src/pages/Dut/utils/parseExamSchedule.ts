import { Examination } from "../../../types/Course";

export function parseExamSchedule(html: string): Examination[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const table = doc.getElementById("TTKB_GridLT") as HTMLTableElement;

  if (!table) return [];

  const rows = Array.from(table.rows);
  const dataRows = rows.filter(
    (row) =>
      row.classList.contains("GridRow") && !row.classList.contains("kctHeader"),
  );

  return dataRows.map((data) => {
    const cells = Array.from(data.cells);
    return {
      index: cells[0]?.textContent?.trim() || "",
      examinationCode: cells[1]?.textContent?.trim() || "",
      examinationName: cells[2]?.textContent?.trim() || "",
      group: cells[3]?.textContent?.trim() || "",
      generalExam: cells[4]?.textContent?.trim() || "",
      schedule: cells[5]?.textContent?.trim() || "",
    };
  });
}

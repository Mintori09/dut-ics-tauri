import { AcademicResult } from "../../../types/Score";

export function parseAcademicResults(html: string): AcademicResult[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const table = doc.getElementById("KQRLGridTH") as HTMLTableElement;

  if (!table) return [];

  const rows = Array.from(table.rows).filter((row) =>
    row.classList.contains("GridRow"),
  );

  return rows.map((row) => {
    const cells = Array.from(row.cells);

    return {
      semester: cells[0]?.textContent?.trim() || "",
      registeredCredits: cells[1]?.textContent?.trim() || "",
      retakenCredits: cells[2]?.textContent?.trim() || "",
      avg4Semester: cells[3]?.textContent?.trim() || "",
      avgScholarship: cells[4]?.textContent?.trim() || "",
      avg10Semester: cells[5]?.textContent?.trim() || "",
      classification: cells[6]?.textContent?.trim() || "",
      conductScore: cells[7]?.textContent?.trim() || "",
      warning: cells[8]?.textContent?.trim() || "",
      accumulatedCredits: cells[9]?.textContent?.trim() || "",
      avg4Accumulated: cells[10]?.textContent?.trim() || "",
      avgConductAll: cells[11]?.textContent?.trim() || "",
    };
  });
}

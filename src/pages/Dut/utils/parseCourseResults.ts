import { CourseResult } from "../../../types/Score";

export function parseCourseResults(html: string): CourseResult[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const table = doc.getElementById("KQRLGridKQHT") as HTMLTableElement;

  if (!table) return [];

  const rows = Array.from(table.rows).filter((row) =>
    row.classList.contains("GridRow"),
  );

  return rows.map((row) => {
    const cells = Array.from(row.cells);

    return {
      index: cells[0]?.textContent?.trim() || "",
      semester: cells[1]?.textContent?.trim() || "",
      subSemester: cells[2]?.textContent?.trim() || "",
      classCode: cells[3]?.textContent?.trim() || "",
      className: cells[4]?.textContent?.trim() || "",
      credits: cells[5]?.textContent?.trim() || "",
      formula: cells[6]?.textContent?.trim() || "",

      BT: cells[7]?.textContent?.trim() || "",
      CK: cells[8]?.textContent?.trim() || "",
      DA: cells[9]?.textContent?.trim() || "",
      GK: cells[10]?.textContent?.trim() || "",
      QT: cells[11]?.textContent?.trim() || "",
      TH: cells[12]?.textContent?.trim() || "",

      score10: cells[13]?.textContent?.trim() || "",
      score4: cells[14]?.textContent?.trim() || "",
      letter: cells[15]?.textContent?.trim() || "",

      survey: cells[16]?.textContent?.trim() || "",
      surveyDone: cells[17]?.textContent?.trim() || "",
    };
  });
}

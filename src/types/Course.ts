export interface Course {
  index: number;
  courseCode: string;
  courseName: string;
  credit: number;
  lecturer: string;
  schedule: string;
  weeks: string;
  registrationTime: string;
  retake: boolean;
  registered: string;
  isClc: boolean;
}

export function convertToCourses(raw: any[]): Course[] {
  return raw.map((item) => ({
    index: parseInt(item.tt),
    courseCode: item["mã_lớp_học_phần"],
    courseName: item["tên_lớp_học_phần"],
    credit: parseInt(item["số_tc"]) || 0,
    lecturer: item["giảng_viên"],
    schedule: item["thời_khóa_biểu"],
    weeks: item["tuần_học"],
    registrationTime: item["hạn_hiện_điểm"] || "",
    retake: item["học_lại"]?.trim() !== "",
    registered: item["dssv"],
    isClc: item["clc"]?.trim() !== "",
  }));
}

export function tableToJson(): Course[] {
  const table = document.getElementById("TTKB_GridInfo") as HTMLTableElement;
  const data: any[] = [];

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

  for (const row of dataRows) {
    const cells = Array.from(row.cells);
    const rowData: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      rowData[headers[i]] = cells[i]?.textContent?.trim() || "";
    }
    data.push(rowData);
  }

  const courses = convertToCourses(data);
  console.log(courses);
  return courses;
}

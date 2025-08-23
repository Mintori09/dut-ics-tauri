import { Course } from "../../../types/Course";

export function mapRawRowsToCourses(raw: any[]): Course[] {
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

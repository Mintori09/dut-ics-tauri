export interface AcademicResult {
  semester: string; // Học kỳ / Năm học
  registeredCredits: string; // Số tín chỉ đăng ký
  retakenCredits: string; // Số tín chỉ học lại
  avg4Semester: string; // Điểm TBC học kỳ T4
  avgScholarship: string; // Điểm TBC học bổng
  avg10Semester: string; // Điểm TBC học kỳ T10
  classification: string; // Xếp loại học tập
  conductScore: string; // Điểm rèn luyện
  warning: string; // Bị cảnh báo KQHT
  accumulatedCredits: string; // Số tín chỉ tích lũy
  avg4Accumulated: string; // Điểm TBC tích lũy T4
  avgConductAll: string; // Điểm TB RL các kỳ
}

export interface CourseResult {
  index: string; // TT
  semester: string; // Kỳ / Năm học
  subSemester: string; // Kỳ phụ
  classCode: string; // Mã lớp học phần
  className: string; // Tên lớp học phần
  credits: string; // Số TC
  formula: string; // Công thức điểm

  // Điểm thành phần
  BT: string; // Bài tập
  CK: string; // Cuối kỳ
  DA: string; // Đồ án
  GK: string; // Giữa kỳ
  QT: string; // Quá trình
  TH: string; // Thực hành

  score10: string; // Thang 10
  score4: string; // Thang 4
  letter: string; // Điểm chữ

  survey: string; // Lấy ý kiến
  surveyDone: string; // Đã góp ý
}

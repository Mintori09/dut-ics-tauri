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

export interface Examination {
  index: string;
  examinationCode: string;
  examinationName: string;
  group: string;
  generalExam: string;
  schedule: string;
}

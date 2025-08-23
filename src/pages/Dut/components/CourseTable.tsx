import { Course } from "../../../types/Course";

export function CourseTable({ courses }: { courses: Course[] }) {
  if (!courses || courses.length === 0) {
    return <p>Không có lịch học</p>;
  }

  return (
    <table className="w-full border border-gray-300 mt-4 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1">#</th>
          <th className="border px-2 py-1">Mã môn</th>
          <th className="border px-2 py-1">Tên môn</th>
          <th className="border px-2 py-1">Số tín chỉ</th>
          <th className="border px-2 py-1">Giảng viên</th>
          <th className="border px-2 py-1">Lịch học</th>
          <th className="border px-2 py-1">Tuần</th>
          <th className="border px-2 py-1">Đăng ký</th>
        </tr>
      </thead>
      <tbody>
        {courses.map((c, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="border px-2 py-1">{c.index}</td>
            <td className="border px-2 py-1">{c.courseCode}</td>
            <td className="border px-2 py-1">{c.courseName}</td>
            <td className="border px-2 py-1">{c.credit}</td>
            <td className="border px-2 py-1">{c.lecturer}</td>
            <td className="border px-2 py-1">{c.schedule}</td>
            <td className="border px-2 py-1">{c.weeks}</td>
            <td className="border px-2 py-1">{c.registered}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

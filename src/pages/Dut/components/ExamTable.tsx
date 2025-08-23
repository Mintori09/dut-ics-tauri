import { Examination } from "../../../types/Course";

export function ExaminationTable({ exams }: { exams: Examination[] }) {
  if (!exams || exams.length === 0) {
    return <p>Không có lịch thi</p>;
  }

  return (
    <table className="w-full border border-gray-300 mt-4 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1">#</th>
          <th className="border px-2 py-1">Mã HP</th>
          <th className="border px-2 py-1">Tên môn</th>
          <th className="border px-2 py-1">Nhóm</th>
          <th className="border px-2 py-1">Thi chung</th>
          <th className="border px-2 py-1">Lịch thi</th>
        </tr>
      </thead>
      <tbody>
        {exams.map((e, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="border px-2 py-1">{e.index}</td>
            <td className="border px-2 py-1">{e.examinationCode}</td>
            <td className="border px-2 py-1">{e.examinationName}</td>
            <td className="border px-2 py-1">{e.group}</td>
            <td className="border px-2 py-1">{e.generalExam}</td>
            <td className="border px-2 py-1">{e.schedule}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

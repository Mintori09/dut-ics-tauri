import { CourseResult } from "../../../types/Score";

interface CourseResultsTableProps {
  data: CourseResult[];
}

export default function CourseResultsTable({ data }: CourseResultsTableProps) {
  return (
    <div className="mb-6 overflow-x-auto">
      <h3 className="font-semibold text-lg mb-2">Chi tiết lớp học phần</h3>
      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">TT</th>
            <th className="border p-2">Học kỳ</th>
            <th className="border p-2">Mã lớp HP</th>
            <th className="border p-2">Tên lớp HP</th>
            <th className="border p-2">TC</th>

            {/* Ẩn trên màn hình nhỏ, hiện trên md trở lên */}
            <th className="border p-2 hidden md:table-cell">Công thức</th>
            <th className="border p-2 hidden lg:table-cell">BT</th>
            <th className="border p-2 hidden lg:table-cell">CK</th>
            <th className="border p-2 hidden lg:table-cell">DA</th>
            <th className="border p-2 hidden lg:table-cell">GK</th>
            <th className="border p-2 hidden lg:table-cell">QT</th>
            <th className="border p-2 hidden lg:table-cell">TH</th>

            {/* Luôn hiển thị vì quan trọng */}
            <th className="border p-2">Thang 10</th>
            <th className="border p-2 hidden md:table-cell">Thang 4</th>
            <th className="border p-2">Chữ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.index}>
              <td className="border p-2">{row.index}</td>
              <td className="border p-2">{row.semester}</td>
              <td className="border p-2">{row.classCode}</td>
              <td className="border p-2">{row.className}</td>
              <td className="border p-2">{row.credits}</td>

              <td className="border p-2 hidden md:table-cell">{row.formula}</td>
              <td className="border p-2 hidden lg:table-cell">{row.BT}</td>
              <td className="border p-2 hidden lg:table-cell">{row.CK}</td>
              <td className="border p-2 hidden lg:table-cell">{row.DA}</td>
              <td className="border p-2 hidden lg:table-cell">{row.GK}</td>
              <td className="border p-2 hidden lg:table-cell">{row.QT}</td>
              <td className="border p-2 hidden lg:table-cell">{row.TH}</td>

              <td className="border p-2">{row.score10}</td>
              <td className="border p-2 hidden md:table-cell">{row.score4}</td>
              <td className="border p-2">{row.letter}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

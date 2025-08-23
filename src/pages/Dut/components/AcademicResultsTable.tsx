import { AcademicResult } from "../../../types/Score";

interface AcademicResultsTableProps {
  data: AcademicResult[];
}

export default function AcademicResultsTable({
  data,
}: AcademicResultsTableProps) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Kết quả tích lũy</h3>

      {/* Bảng cho màn hình >= md */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Học kỳ</th>
              <th className="border p-2">Số TC ĐK</th>
              <th className="border p-2">Số TC TL</th>
              <th className="border p-2">TBC T4</th>
              <th className="border p-2">TBC T10</th>
              <th className="border p-2">Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td className="border p-2">{row.semester}</td>
                <td className="border p-2">{row.registeredCredits}</td>
                <td className="border p-2">{row.accumulatedCredits}</td>
                <td className="border p-2">{row.avg4Semester}</td>
                <td className="border p-2">{row.avg10Semester}</td>
                <td className="border p-2">{row.classification}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view cho mobile */}
      <div className="space-y-2 md:hidden">
        {data.map((row, idx) => (
          <div key={idx} className="border rounded p-3 shadow-sm">
            <div>
              <span className="font-medium">Học kỳ:</span> {row.semester}
            </div>
            <div>
              <span className="font-medium">Số TC ĐK:</span>{" "}
              {row.registeredCredits}
            </div>
            <div>
              <span className="font-medium">Số TC TL:</span>{" "}
              {row.accumulatedCredits}
            </div>
            <div>
              <span className="font-medium">TBC T4:</span> {row.avg4Semester}
            </div>
            <div>
              <span className="font-medium">TBC T10:</span> {row.avg10Semester}
            </div>
            <div>
              <span className="font-medium">Xếp loại:</span>{" "}
              {row.classification}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

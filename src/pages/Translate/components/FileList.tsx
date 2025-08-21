import { CheckCircle, XCircle, Hourglass } from "lucide-react";
import type { TranslateOutput } from "../types/TranslateInput";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";

const getStatusIcon = (status: boolean | undefined) => {
  if (status === true)
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  if (status === false) return <XCircle className="w-5 h-5 text-red-500" />;
  return <Hourglass className="w-5 h-5 text-gray-400" />;
};

const getStatusText = (f: TranslateOutput) => {
  if (f.is_translated === true)
    return `✅ Đã dịch → ${f.translate_input.output_path}`;
  if (f.is_translated === false) return `❌ Lỗi khi dịch`;
  return "⏳ Chưa dịch";
};

export function FileList({ files }: { files: TranslateOutput[] }) {
  if (files.length === 0) return null;

  const sortedFiles = [...files].sort((a, b) => {
    const getStatusPriority = (val: boolean | undefined) =>
      val === true ? 0 : val === false ? 1 : 2;
    return (
      getStatusPriority(a.is_translated) - getStatusPriority(b.is_translated)
    );
  });

  return (
    <Card className="shadow-sm border rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          📂 Danh sách file đã chọn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-200">
          {sortedFiles.map((f, idx) => (
            <li key={idx} className="flex items-start gap-3 py-2">
              {getStatusIcon(f.is_translated)}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {f.translate_input.input_path}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getStatusText(f)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

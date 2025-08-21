import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Loader2 } from "lucide-react";
import { FileList } from "../components/FileList";
import { useTranslator } from "../hooks/useTranslator";

export default function TranslateFilePage() {
  const {
    files,
    fromLang,
    toLang,
    loading,
    setFromLang,
    setToLang,
    handleSelectFiles,
    handleTranslate,
  } = useTranslator();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">📄 Batch File Translator</h1>

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 p-4">
          <Input
            placeholder="From"
            value={fromLang}
            onChange={(e) => setFromLang(e.target.value)}
          />
          <Input
            placeholder="To"
            value={toLang}
            onChange={(e) => setToLang(e.target.value)}
          />
          <Button variant="outline" onClick={handleSelectFiles}>
            📂 Chọn File
          </Button>
          <Button
            onClick={handleTranslate}
            disabled={files.length === 0 || loading}
          >
            🔄 Dịch
          </Button>
        </CardContent>
      </Card>

      <FileList files={files} />

      {loading && (
        <div className="flex flex-col items-center mt-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">
            ⏳ Đang dịch, vui lòng chờ...
          </p>
        </div>
      )}
    </div>
  );
}

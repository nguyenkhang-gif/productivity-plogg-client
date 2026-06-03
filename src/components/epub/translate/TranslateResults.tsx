import { CheckCircle2, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TranslatedFile } from "@/core/hooks/epub/useTranslation";

interface TranslateResultsProps {
  results: TranslatedFile[];
  onPreview: (file: { name: string; text: string }) => void;
  onDownloadOne: (name: string, text: string) => void;
  onDownloadAll: () => void;
}

export function TranslateResults({ results, onPreview, onDownloadOne, onDownloadAll }: TranslateResultsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Kết quả — {results.length} file(s)
        </p>
        {results.length > 1 && (
          <Button variant="ghost" size="sm" onClick={onDownloadAll} className="text-gray-400 hover:text-white h-7 px-3">
            <Download className="h-3.5 w-3.5 mr-1.5" />Tải tất cả
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {results.map((r) => (
          <div key={r.name} className="bg-[#161925] rounded-xl px-4 py-3 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{r.name}</p>
              <p className="text-[10px] text-gray-600">{r.wordCount.toLocaleString()} words dịch</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Button
                variant="ghost" size="sm"
                onClick={() => onPreview({ name: r.name, text: r.text })}
                className="text-gray-400 hover:text-[#0E78F9] h-7 px-2"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />Preview
              </Button>
              <Button
                variant="ghost" size="sm"
                onClick={() => onDownloadOne(r.name, r.text)}
                className="text-gray-400 hover:text-white h-7 px-2"
              >
                <Download className="h-3.5 w-3.5 mr-1" />.txt
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

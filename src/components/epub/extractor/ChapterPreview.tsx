import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExtractedChapter } from "@/core/lib/epub/extractChapters";

interface ChapterPreviewProps {
  chapter: ExtractedChapter | null;
  onExport: () => void;
}

export function ChapterPreview({ chapter, onExport }: ChapterPreviewProps) {
  if (!chapter) {
    return (
      <div className="flex-1 flex items-center justify-center text-center text-gray-600">
        <div>
          <FileText className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Click a chapter to preview</p>
          <p className="text-xs mt-1">Check chapters to send to Context mode</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <div>
          <p className="font-medium text-gray-100">{chapter.title}</p>
          <p className="text-xs text-gray-500">{chapter.wordCount.toLocaleString()} words</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onExport} className="text-gray-400 hover:text-white">
          <Download className="h-3.5 w-3.5 mr-1.5" />.txt
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-gray-300 text-sm leading-7 whitespace-pre-wrap font-mono">{chapter.text}</p>
      </div>
    </>
  );
}

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { contextToMarkdown } from "@/core/lib/epub/contextToMarkdown";

interface ContextPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  contextJson: string;
  title?: string;
}

export function ContextPreviewDialog({ open, onClose, contextJson, title }: ContextPreviewDialogProps) {
  const markdown = useMemo(() => contextToMarkdown(contextJson), [contextJson]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] bg-surface border-gray-700 text-white flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-800 shrink-0">
          <DialogTitle className="text-gray-100 text-base">{title ?? "Context Preview"}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-5 flex-1">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-semibold text-gray-200 mt-5 mb-2 pb-1 border-b border-gray-700">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-300 mt-3 mb-1">{children}</h3>,
              p: ({ children }) => <p className="text-sm text-gray-300 mb-2 leading-relaxed">{children}</p>,
              table: ({ children }) => <div className="overflow-x-auto mb-3"><table className="w-full text-xs text-left border-collapse">{children}</table></div>,
              thead: ({ children }) => <thead className="bg-gray-800/60">{children}</thead>,
              tbody: ({ children }) => <tbody className="divide-y divide-gray-800">{children}</tbody>,
              th: ({ children }) => <th className="px-3 py-1.5 font-medium text-gray-400 whitespace-nowrap">{children}</th>,
              td: ({ children }) => <td className="px-3 py-1.5 text-gray-300">{children}</td>,
              ul: ({ children }) => <ul className="list-disc list-inside text-sm text-gray-300 mb-2 space-y-0.5 ml-2">{children}</ul>,
              li: ({ children }) => <li className="text-sm text-gray-300">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-gray-200">{children}</strong>,
              hr: () => <hr className="border-gray-700 my-3" />,
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  );
}

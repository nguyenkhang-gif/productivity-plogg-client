import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface TranslationPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  name: string;
  text: string;
}

export function TranslationPreviewDialog({ open, onClose, name, text }: TranslationPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-[#1C1F2E] border-gray-700 text-white flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-800 shrink-0">
          <DialogTitle className="text-gray-100 text-base truncate">{name}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-5 flex-1">
          <p className="text-sm text-gray-300 leading-7 whitespace-pre-wrap">{text}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

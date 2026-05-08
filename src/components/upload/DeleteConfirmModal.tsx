import { FileItem } from "@/core/services/api/upload";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface Props {
  target: FileItem;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ target, isDeleting, onConfirm, onCancel }: Props) {
  return (
    <ConfirmDialog
      title="Xóa file?"
      subtitle={target.name}
      message="Hành động này không thể hoàn tác."
      confirmLabel="Xóa"
      loadingLabel="Đang xóa..."
      isLoading={isDeleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

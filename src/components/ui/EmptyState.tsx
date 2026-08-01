import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /** Icon (lucide) hiển thị phía trên — tùy chọn */
  icon?: LucideIcon;
  /** Dòng chính */
  title: string;
  /** Mô tả phụ — tùy chọn */
  description?: string;
  /** Nội dung thêm (nút hành động...) — tùy chọn */
  children?: React.ReactNode;
  /** Class bổ sung cho container */
  className?: string;
}

/**
 * Empty/placeholder state dùng chung: icon + tiêu đề + mô tả, canh giữa.
 * Theme-aware qua token text-text-muted / text-text-secondary.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 text-center text-text-muted select-none px-4 ${className}`}
    >
      {Icon && <Icon className="h-8 w-8 opacity-60" />}
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {description && <p className="text-xs text-text-muted">{description}</p>}
      {children}
    </div>
  );
}

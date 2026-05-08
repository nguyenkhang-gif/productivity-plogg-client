export function useFileHelpers() {
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (name: string): boolean =>
    /\.(png|jpe?g|gif|webp|svg)$/i.test(name);

  const isOverSize = (file: File, maxMB = 5): boolean =>
    file.size > maxMB * 1024 * 1024;

  const filterOversized = (files: File[], maxMB = 5): File[] =>
    files.filter((f) => isOverSize(f, maxMB));

  return { formatBytes, isImage, isOverSize, filterOversized };
}

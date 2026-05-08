export type Bucket = "files" | "icons";

export interface PendingFile {
  file: File;
  previewUrl: string | null;
}

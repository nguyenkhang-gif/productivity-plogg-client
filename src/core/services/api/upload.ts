import axiosInstance from "@/core/lib/axiosInstance";

export interface FileItem {
  name: string;
  publicId?: string; // provider-specific ID used for deletion (Cloudinary)
  publicUrl: string;
  size: number;
  createdAt: string;
}

export interface PaginatedFiles {
  items: FileItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const uploadApi = {
  uploadFile: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await axiosInstance.post<{ publicUrl: string }>("/upload/file", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.publicUrl;
  },

  uploadIcon: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await axiosInstance.post<{ publicUrl: string }>("/upload/icon", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.publicUrl;
  },

  listFiles: (page = 1, limit = 20): Promise<PaginatedFiles> =>
    axiosInstance
      .get<PaginatedFiles>("/upload/files", { params: { page, limit } })
      .then((r) => r.data),

  listIcons: (page = 1, limit = 20): Promise<PaginatedFiles> =>
    axiosInstance
      .get<PaginatedFiles>("/upload/icons", { params: { page, limit } })
      .then((r) => r.data),

  deleteFile: (fileName: string): Promise<void> =>
    axiosInstance.delete(`/upload/files/${fileName}`).then(() => undefined),

  deleteIcon: (fileName: string): Promise<void> =>
    axiosInstance.delete(`/upload/icons/${fileName}`).then(() => undefined),
};

import axiosInstance from "@/core/lib/axiosInstance";
import { FileItem, PaginatedFiles } from "./upload";

interface CloudinaryItem {
  publicId: string;
  url: string;
  format: string;
  size: number;
  createdAt: string;
}

interface CloudinaryPaginated {
  items: CloudinaryItem[];
  pagination: PaginatedFiles["pagination"];
}

function normalize(item: CloudinaryItem): FileItem {
  const base = item.publicId.split("/").pop() ?? item.publicId;
  const name = item.format ? `${base}.${item.format}` : base;
  return {
    name,
    publicId: item.publicId,
    publicUrl: item.url,
    size: item.size,
    createdAt: item.createdAt,
  };
}

export const cloudinaryApi = {
  uploadFile: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await axiosInstance.post<{ url: string }>("/cloudinary/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  },

  uploadIcon: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await axiosInstance.post<{ url: string }>("/cloudinary/icon", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  },

  listFiles: (page = 1, limit = 20): Promise<PaginatedFiles> =>
    axiosInstance
      .get<CloudinaryPaginated>("/cloudinary/files", { params: { page, limit } })
      .then((r) => ({ items: r.data.items.map(normalize), pagination: r.data.pagination })),

  listIcons: (page = 1, limit = 20): Promise<PaginatedFiles> =>
    axiosInstance
      .get<CloudinaryPaginated>("/cloudinary/icons", { params: { page, limit } })
      .then((r) => ({ items: r.data.items.map(normalize), pagination: r.data.pagination })),

  deleteFile: (publicId: string): Promise<void> =>
    axiosInstance.delete(`/cloudinary/files/${publicId}`).then(() => undefined),

  deleteIcon: (publicId: string): Promise<void> =>
    axiosInstance.delete(`/cloudinary/files/${publicId}`).then(() => undefined),
};

import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { uploadApi } from "@/core/services/api/upload";
import { cloudinaryApi } from "@/core/services/api/cloudinary";

export function useUploadProvider() {
  const provider = useSelector((s: RootState) => s.upload.provider);
  return provider === "cloudinary" ? cloudinaryApi : uploadApi;
}

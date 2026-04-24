import axiosInstance from "@/core/lib/axiosInstance";
// Thêm vào file hiện tại của bạn
export const uploadVideoForTranscription = async (
    file: File, 
    onProgress?: (percent: number) => void
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const res = await axiosInstance.post("/transcription/convert", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Theo dõi tiến độ upload thực tế từ trình duyệt lên server
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
        // File lớn cần tăng timeout riêng cho request này (30 phút)
        timeout: 30 * 60 * 1000, 
      });
  
      return res.data;
    } catch (error) {
      console.error("Lỗi Upload/Transcription:", error);
      throw error;
    }

  };
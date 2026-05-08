import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FileItem } from "@/core/services/api/upload";

export type CloudProvider = "default" | "cloudinary";

function loadProvider(): CloudProvider {
  if (typeof window === "undefined") return "default";
  return (localStorage.getItem("cloudProvider") as CloudProvider) ?? "default";
}

interface UploadState {
  icons: FileItem[];
  iconPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  provider: CloudProvider;
}

const initialState: UploadState = {
  icons: [],
  iconPagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  provider: "default",
};

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    setIcons(
      state,
      action: PayloadAction<{
        items: FileItem[];
        pagination: UploadState["iconPagination"];
      }>
    ) {
      state.icons = action.payload.items;
      state.iconPagination = action.payload.pagination;
    },

    removeIcon(state, action: PayloadAction<string>) {
      state.icons = state.icons.filter((i) => i.name !== action.payload);
      state.iconPagination.total = Math.max(0, state.iconPagination.total - 1);
    },

    prependIcon(state, action: PayloadAction<FileItem>) {
      state.icons.unshift(action.payload);
      state.iconPagination.total += 1;
    },

    setProvider(state, action: PayloadAction<CloudProvider>) {
      state.provider = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("cloudProvider", action.payload);
      }
    },

    initProvider(state) {
      state.provider = loadProvider();
    },
  },
});

export const { setIcons, removeIcon, prependIcon, setProvider, initProvider } = uploadSlice.actions;
export default uploadSlice.reducer;

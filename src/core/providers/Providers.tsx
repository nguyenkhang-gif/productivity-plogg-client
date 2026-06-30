"use client";

import { ThemeProvider } from "next-themes";
import StoreProvider from "./ReduxProvider";
import ReactQueryProvider from "./ReactQuery";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} themes={["dark", "light", "sepia"]}>
      <ReactQueryProvider>
        <StoreProvider>
          {children}
        </StoreProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  );
}

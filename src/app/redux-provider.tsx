// src/components/StoreProvider.tsx
import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { useAuth } from "@/hooks/auth/useAuth";

interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    // Hiển thị loading khi đang xử lý
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.5rem",
        }}
      >
        Loading...
      </div>
    );
  }else return <Provider store={store}>{children}</Provider>; // Render nội dung sau khi xác thực
};

export default StoreProvider;

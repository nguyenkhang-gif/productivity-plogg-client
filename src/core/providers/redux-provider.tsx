// src/components/StoreProvider.tsx
import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import store from "@/core/redux/store";
import { useAuth } from "@/core/hooks/auth/useAuth";

interface StoreProviderProps {
  children: ReactNode;
}

const AuthLoader: React.FC<{ children: ReactNode }> = ({ children }) => {
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
  }
  return <>{children}</>;
};

const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthLoader>{children}</AuthLoader>
    </Provider>
  );
};

export default StoreProvider;

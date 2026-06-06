"use client";

import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import store from "@/core/redux/store";
import { useAuth } from "@/core/hooks/auth/useAuth";

interface StoreProviderProps {
  children: ReactNode;
}

// Trigger useAuth bên trong Provider để khởi tạo session restore
const AuthBootstrap: React.FC<{ children: ReactNode }> = ({ children }) => {
  useAuth();
  return <>{children}</>;
};

const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </Provider>
  );
};

export default StoreProvider;

"use client";

import { createContext, useContext } from "react";

const AdminModeContext = createContext(false);

export function AdminModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <AdminModeContext.Provider value={true}>{children}</AdminModeContext.Provider>
  );
}

export function useIsAdmin(): boolean {
  return useContext(AdminModeContext);
}

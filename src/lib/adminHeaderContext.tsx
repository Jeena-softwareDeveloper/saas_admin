"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PageHeaderData {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  filter?: ReactNode;
}

interface AdminHeaderContextType {
  header: PageHeaderData | null;
  setHeader: (h: PageHeaderData | null) => void;
}

const AdminHeaderContext = createContext<AdminHeaderContextType>({
  header: null,
  setHeader: () => {},
});

export function AdminHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<PageHeaderData | null>(null);
  return (
    <AdminHeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </AdminHeaderContext.Provider>
  );
}

export function useAdminHeader() {
  return useContext(AdminHeaderContext);
}

/**
 * Drop this inside any admin page to set the topbar title + subtitle + action button + filters.
 * Renders nothing — just registers data into the shared AdminHeaderContext.
 */
export function SetAdminHeader({ title, subtitle, action, filter }: PageHeaderData) {
  const { setHeader } = useContext(AdminHeaderContext);

  useEffect(() => {
    setHeader({ title, subtitle, action, filter });
    return () => setHeader(null); // Clear on unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle]);

  return null;
}

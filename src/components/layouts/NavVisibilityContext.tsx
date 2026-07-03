"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

interface NavVisibilityValue {
  navHidden: boolean;
  setNavHidden: (hidden: boolean) => void;
  toggleNav: () => void;
}

const NavVisibilityContext = createContext<NavVisibilityValue>({
  navHidden: false,
  setNavHidden: () => {},
  toggleNav: () => {},
});

export function NavVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [navHidden, setNavHidden] = useState(false);
  const pathname = usePathname();

  // Hiding the nav is a per-page choice — navigating away always restores it
  useEffect(() => {
    setNavHidden(false);
  }, [pathname]);

  const value = useMemo(
    () => ({
      navHidden,
      setNavHidden,
      toggleNav: () => setNavHidden((v) => !v),
    }),
    [navHidden]
  );

  return (
    <NavVisibilityContext.Provider value={value}>
      {children}
    </NavVisibilityContext.Provider>
  );
}

export function useNavVisibility() {
  return useContext(NavVisibilityContext);
}

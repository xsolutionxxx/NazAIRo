"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import store from "./store/store";
import { useAppDispatch } from "@shared/lib/hooks/redux";
import { checkAuth } from "@/features/auth/model/authActions";

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (localStorage.getItem("was_logged_in")) {
      dispatch(checkAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Provider store={store}>
      <AuthInitializer>
        {mounted && (
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        )}
      </AuthInitializer>
    </Provider>
  );
}

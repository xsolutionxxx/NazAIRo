"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode, Suspense, useEffect, useState } from "react";
import { Provider } from "react-redux";
import store from "./store/store";
import { useAppDispatch } from "@shared/lib/hooks/redux";
import { checkAuth } from "@/features/auth/model/authActions";
import PageLoader from "@shared/ui/PageLoader";

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const wasLoggedIn = localStorage.getItem("was_logged_in");
    const urlParams = new URLSearchParams(window.location.search);
    const isEmailUpdated = urlParams.get("emailUpdated") === "true";
    const pathname = window.location.pathname;
    const isAuthPage = ["/login", "/sign-up", "/verify-email"].some((p) =>
      pathname.startsWith(p),
    );

    if (isEmailUpdated) {
      localStorage.setItem("was_logged_in", "true");
      dispatch(checkAuth());
    } else if (wasLoggedIn && !isAuthPage) {
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
            <Suspense>
              <PageLoader />
            </Suspense>
            {children}
          </ThemeProvider>
        )}
      </AuthInitializer>
    </Provider>
  );
}

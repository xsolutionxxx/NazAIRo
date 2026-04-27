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
    // 1. Перевіряємо localStorage
    const wasLoggedIn = localStorage.getItem("was_logged_in");

    // 2. Перевіряємо URL через стандартний Web API (надійніше для клієнта)
    const urlParams = new URLSearchParams(window.location.search);
    const isEmailUpdated = urlParams.get("emailUpdated") === "true";

    console.log("AuthInitializer check:", { wasLoggedIn, isEmailUpdated });

    if (wasLoggedIn || isEmailUpdated) {
      // Якщо ми зайшли через зміну пошти, обов'язково ставимо мітку в localStorage,
      // щоб наступні переходи по сторінках не викидали нас, поки checkAuth не завершиться.
      if (isEmailUpdated) {
        localStorage.setItem("was_logged_in", "true");
      }

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

"use client";

import { useEffect, useRef, ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";

interface IdleLogoutProviderProps {
  children: ReactNode;
  /** Inactivity time in milliseconds before logout (default: 20min) */
  timeout?: number;
}

const DEFAULT_TIMEOUT = 20 * 60 * 1000; // 20 minutes in ms

export function IdleLogoutProvider({ children, timeout = DEFAULT_TIMEOUT }: IdleLogoutProviderProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { status } = useSession();

  // Handler to reset the inactivity timer
  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    if (status === "authenticated") {
      timer.current = setTimeout(() => {
        signOut({ callbackUrl: '/' });
      }, timeout);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      return;
    }
    // Reset timer initially
    resetTimer();
    // Listen to user activity events
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, timeout]);

  // Optionally: insert a toast/modal for session expiring warning here
  return <>{children}</>;
}

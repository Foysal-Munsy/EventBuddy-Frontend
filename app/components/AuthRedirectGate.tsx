"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthRedirectGateProps {
  children: ReactNode;
  redirectPath?: string;
}

export default function AuthRedirectGate({
  children,
  redirectPath = "/",
}: AuthRedirectGateProps) {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasAuth = () => {
      try {
        const storedUser = window.localStorage.getItem("user");
        const token = window.localStorage.getItem("authToken");
        return Boolean(storedUser || token);
      } catch {
        return false;
      }
    };

    if (hasAuth()) {
      router.replace(redirectPath);
      return;
    }

    const frame = requestAnimationFrame(() => {
      setAllowed(true);
      setChecking(false);
    });

    const handleAuthPresence = () => {
      if (hasAuth()) {
        router.replace(redirectPath);
        setAllowed(false);
        setChecking(true);
      }
    };

    window.addEventListener("authChange", handleAuthPresence);
    window.addEventListener("storage", handleAuthPresence);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("authChange", handleAuthPresence);
      window.removeEventListener("storage", handleAuthPresence);
    };
  }, [redirectPath, router]);

  if (checking || !allowed) {
    return null;
  }

  return <>{children}</>;
}

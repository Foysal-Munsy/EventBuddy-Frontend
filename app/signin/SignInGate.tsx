"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface SignInGateProps {
  children: ReactNode;
}

export default function SignInGate({ children }: SignInGateProps) {
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
      router.replace("/");
      return;
    }

    const frame = requestAnimationFrame(() => {
      setAllowed(true);
      setChecking(false);
    });

    const handleAuthChange = () => {
      if (hasAuth()) {
        router.replace("/");
        setAllowed(false);
        setChecking(true);
      }
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, [router]);

  if (checking || !allowed) {
    return null;
  }

  return <>{children}</>;
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface UserGateProps {
  children: ReactNode;
  redirectPath?: string;
  adminRedirectPath?: string;
}

type GateState = "checking" | "allowed" | "denied";

export default function UserGate({
  children,
  redirectPath = "/signin",
  adminRedirectPath = "/admin",
}: UserGateProps) {
  const [state, setState] = useState<GateState>("checking");
  const [message, setMessage] = useState("Verifying access...");
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const readRole = () => {
      try {
        const raw = window.localStorage.getItem("user");
        if (!raw) return "";
        const parsed = JSON.parse(raw);
        return String(parsed?.role ?? "").toLowerCase();
      } catch {
        return "";
      }
    };

    const hasToken = () => {
      try {
        const token = window.localStorage.getItem("authToken");
        return Boolean(token);
      } catch {
        return false;
      }
    };

    const evaluate = () => {
      const token = hasToken();
      const role = readRole();

      if (token && role === "user") {
        setState("allowed");
        setMessage("");
        return;
      }

      setState("denied");
      if (!token) {
        setMessage("Redirecting to sign in...");
        router.replace(redirectPath);
        return;
      }

      if (role === "admin") {
        setMessage("Admins cannot open the user dashboard.");
        router.replace(adminRedirectPath);
      } else {
        setMessage("User dashboard requires a user account.");
        router.replace(redirectPath);
      }
    };

    evaluate();
    const handleAuthChange = () => evaluate();
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, [adminRedirectPath, redirectPath, router]);

  if (state !== "allowed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f5ff] p-6 text-[#7a6aa8]">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">{message}</p>
          {state === "denied" && (
            <p className="text-sm">
              Please sign in with a user role to view your dashboard.
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AdminGateProps {
  children: ReactNode;
  redirectPath?: string;
}

type GateStatus = "checking" | "allowed" | "denied";

export default function AdminGate({
  children,
  redirectPath = "/signin",
}: AdminGateProps) {
  const [status, setStatus] = useState<GateStatus>("checking");
  const [message, setMessage] = useState("Validating access...");
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAdminUser = () => {
      try {
        const userRaw = window.localStorage.getItem("user");
        if (!userRaw) return false;
        const user = JSON.parse(userRaw);
        const role = String(user?.role ?? "").toLowerCase();
        return role === "admin";
      } catch {
        return false;
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
      const tokenPresent = hasToken();
      const admin = isAdminUser();
      if (tokenPresent && admin) {
        setStatus("allowed");
        setMessage("");
        return;
      }
      setStatus("denied");
      setMessage("Redirecting to sign in...");
      router.replace(redirectPath);
    };

    evaluate();
    const handleAuthChange = () => evaluate();
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, [redirectPath, router]);

  if (status !== "allowed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f3ff] p-6 text-[#7a6aa8]">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">{message}</p>
          {status === "denied" && (
            <p className="text-sm">
              You must be signed in with an admin account to view this page.
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
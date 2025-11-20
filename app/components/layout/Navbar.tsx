"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlineTicket } from "react-icons/hi";
import Swal from "sweetalert2";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const router = useRouter();

  const getUserDisplayName = (u: Record<string, unknown> | null) => {
    if (!u) return "";
    const s = (k: string) => {
      const v = u[k];
      return typeof v === "string" ? v : "";
    };
    const full = s("fullName") || s("full_name") || s("name");
    if (full) return full;
    const first = s("firstName") || s("first");
    const last = s("lastName") || s("last");
    return `${first} ${last}`.trim() || "";
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const readAuth = () => {
      if (typeof window === "undefined") return;
      try {
        const storedUser = window.localStorage.getItem("user");
        const token = window.localStorage.getItem("authToken");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsLoggedIn(true);
          return;
        }
        setUser(null);
        setIsLoggedIn(Boolean(token));
      } catch {
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    readAuth();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "authToken" || e.key === "user") readAuth();
    };
    const onAuthChange = () => readAuth();

    window.addEventListener("storage", onStorage);
    window.addEventListener("authChange", onAuthChange);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChange", onAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    const confirmResult = await Swal.fire({
      title: "Sign out?",
      text: "You will need to sign in again to access your events.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, sign out",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.warn("Logout API failed", error);
    }

    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    } catch {}

    window.dispatchEvent(new Event("authChange"));

    await Swal.fire({
      title: "Signed out",
      text: "Come back anytime!",
      icon: "success",
      timer: 1400,
      showConfirmButton: false,
      timerProgressBar: true,
    });

    router.push("/");
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? "backdrop-blur-sm bg-white/60 shadow-lg border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo (left) */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div
                className="flex items-center justify-center"
                style={{ color: "var(--primary)" }}
              >
                <HiOutlineTicket
                  size={28}
                  className="text-(--primary)"
                  aria-hidden
                />
              </div>
              <span
                className="text-xl font-bold"
                style={{ color: "var(--primary)" }}
              >
                Event buddy.
              </span>
            </Link>
          </div>

          {/* Right: Sign In / Sign Up buttons (unified design) */}
          <div className="flex items-center space-x-3">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/signin"
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium"
                  style={{
                    backgroundImage: "var(--btn-gradient)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium"
                  style={{
                    backgroundImage: "var(--btn-gradient)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-800">
                  {getUserDisplayName(user) || "Account"}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-red-50 text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

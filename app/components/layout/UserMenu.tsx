"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

type StoredUser = Record<string, unknown> | null;

export default function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<StoredUser>(null);
  const router = useRouter();

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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    const confirmResult = await Swal.fire({
      title: "Sign out?",
      text: "You will need to sign in again to access your account.",
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
    } catch (logoutError) {
      console.warn("Logout failed", logoutError);
    }

    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    } catch {}

    window.dispatchEvent(new Event("authChange"));
    setIsLoggedIn(false);
    setUser(null);
    setIsMenuOpen(false);

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

  const getUserName = (userData: StoredUser) => {
    if (!userData) return "";
    const value = (key: string) => {
      const val = userData[key];
      return typeof val === "string" ? val : "";
    };
    const fullName =
      value("fullName") ||
      value("full_name") ||
      value("name") ||
      `${value("firstName") || value("first")} ${
        value("lastName") || value("last")
      }`.trim();
    return fullName || "Account";
  };

  const getUserInitials = (userData: StoredUser) => {
    const name = getUserName(userData);
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getUserRole = (userData: StoredUser) => {
    if (!userData) return "";
    const role = userData["role"];
    const roles = userData["roles"];
    if (typeof role === "string") return role;
    if (Array.isArray(roles) && typeof roles[0] === "string") return roles[0];
    return "";
  };

  const userName = getUserName(user);
  const userInitials = getUserInitials(user);
  const userRole = getUserRole(user);
  const isAdmin = userRole === "admin";

  if (!isLoggedIn) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/signin"
          className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-semibold">
            {userInitials}
          </span>
        </div>
        <span className="hidden md:block">{userName}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isMenuOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 capitalize">
              {userRole || "user"}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Profile
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin Panel
            </Link>
          )}

          <div className="border-t border-gray-100 mt-1">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

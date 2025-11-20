"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

function normalizeUser(data: unknown): {
  fullName: string;
  email: string;
  role: string;
} | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const pick = (key: string): string => {
    const val = record[key];
    return typeof val === "string" ? val : "";
  };
  const fullName =
    pick("fullName") ||
    pick("full_name") ||
    pick("name") ||
    `${pick("firstName") || pick("first")} ${
      pick("lastName") || pick("last")
    }`.trim();
  const email = pick("email") || pick("emailAddress") || pick("username");
  const roleSource = record["role"];
  const rolesValue = record["roles"];
  const role =
    typeof roleSource === "string"
      ? roleSource
      : Array.isArray(rolesValue) && typeof rolesValue[0] === "string"
      ? rolesValue[0]
      : "";

  if (!fullName && !email && !role) return null;
  return { fullName, email, role };
}

export default function SignInCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = json?.detail || json?.message || "Invalid credentials";
        throw new Error(message);
      }

      const userDisplay = normalizeUser(json?.user ?? json ?? {});
      console.log("user:", userDisplay);

      try {
        if (userDisplay) {
          localStorage.setItem("user", JSON.stringify(userDisplay));
        }
        const token =
          json?.token || json?.access_token || json?.accessToken || json?.jwt;
        if (token) {
          localStorage.setItem("authToken", token);
        } else if (userDisplay) {
          localStorage.setItem("authToken", "session");
        }
      } catch (storageError) {
        console.warn("Failed to store auth data", storageError);
      }

      window.dispatchEvent(new Event("authChange"));

      await Swal.fire({
        title: userDisplay?.fullName
          ? `Signed in as ${userDisplay.fullName}`
          : "Signed in",
        text: userDisplay?.email || "Welcome back",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="w-[520px] max-w-[92vw] bg-white rounded-lg shadow-md p-7 relative font-sans">
      <h1 className="m-0 text-2xl text-[#2d2a6a] font-extrabold">Sign in</h1>

      <p className="mt-2 mb-5 text-[#7a6aa8]">
        New User?{" "}
        <Link className="text-[#6b4bff] underline" href="/register">
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit}>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <label className="block text-sm text-[#2d2a6a] font-semibold mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="enter your email"
          required
          className="w-full px-4 py-3 rounded-xl border border-[#ece7f8] bg-[#fbfbfd] outline-none mb-4 text-sm text-gray-600"
        />

        <label className="block text-sm text-[#2d2a6a] font-semibold mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="enter your password"
          required
          className="w-full px-4 py-3 rounded-xl border border-[#ece7f8] bg-[#fbfbfd] outline-none mb-6 text-sm text-gray-600"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-md border-0 cursor-pointer bg-linear-to-b from-[#5b61ff] to-[#376bff] text-white text-base font-semibold shadow-md disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

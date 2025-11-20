"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { normalizeUser } from "@/lib/auth";

export default function SignUpCard() {
  const [fullName, setFullName] = useState("");
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
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName, email, password }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          payload?.detail || payload?.message || "Registration failed";
        throw new Error(message);
      }

      const userDisplay = normalizeUser(payload?.user ?? payload ?? {}) ?? {
        fullName,
        email,
        role: "user",
      };
      console.log("registered user:", userDisplay);

      try {
        localStorage.setItem("user", JSON.stringify(userDisplay));
        const token =
          payload?.token ||
          payload?.access_token ||
          payload?.accessToken ||
          payload?.jwt;
        localStorage.setItem("authToken", token || "session");
      } catch (storageError) {
        console.warn("Failed to store auth data", storageError);
      }

      window.dispatchEvent(new Event("authChange"));

      await Swal.fire({
        title: `Welcome${
          userDisplay.fullName ? `, ${userDisplay.fullName}` : ""
        }!`,
        text: "Your account was created successfully",
        icon: "success",
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });

      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-[520px] max-w-[92vw] bg-white rounded-2xl shadow-xl p-8 font-sans">
      <h1 className="text-3xl font-extrabold text-[#2d2a6a]">Sign Up</h1>
      <p className="mt-3 mb-6 text-[#7a6aa8] text-sm">
        Already have an account?{" "}
        <Link className="text-[#6b4bff] underline" href="/signin">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <label className="block text-sm font-semibold text-[#2d2a6a]">
          Full Name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. John Doe"
          required
          className="w-full px-4 py-3 rounded-xl border border-[#ece7f8] bg-[#fbfbfd] text-sm text-gray-700 outline-none"
        />

        <label className="block text-sm font-semibold text-[#2d2a6a]">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="enter your email"
          required
          className="w-full px-4 py-3 rounded-xl border border-[#ece7f8] bg-[#fbfbfd] text-sm text-gray-700 outline-none"
        />

        <label className="block text-sm font-semibold text-[#2d2a6a]">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="enter your password"
          required
          className="w-full px-4 py-3 rounded-xl border border-[#ece7f8] bg-[#fbfbfd] text-sm text-gray-700 outline-none"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl text-white font-semibold text-base shadow-lg disabled:opacity-60"
          style={{
            backgroundImage: "linear-gradient(135deg, #5b61ff, #376bff)",
          }}
        >
          {submitting ? "Creating account..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}

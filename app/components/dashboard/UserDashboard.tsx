"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";

type RegisteredEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  timeslot: string;
  seats: number;
};

export default function UserDashboard() {
  const [userName, setUserName] = useState("there");
  const [registrations, setRegistrations] = useState<RegisteredEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("user");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const fallback = parsed?.name || parsed?.username || parsed?.email;
      if (fallback) {
        setUserName(fallback);
      }
    } catch {
      /* ignore malformed user data */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let cancelled = false;
    const controller = new AbortController();

    const loadBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers: HeadersInit = { "Content-Type": "application/json" };
        try {
          const token = window.localStorage.getItem("authToken");
          if (token && token !== "session") {
            headers["Authorization"] = `Bearer ${token}`;
          }
        } catch {
          /* no token available */
        }

        const response = await fetch(
          "http://localhost:8000/events/my-bookings",
          {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
            headers,
          }
        );

        if (response.status === 401) {
          throw new Error("Please sign in as a user to view your bookings.");
        }

        if (!response.ok) {
          throw new Error(`Failed to load bookings (${response.status})`);
        }

        const payload = await response.json().catch(() => null);
        const list: unknown[] = Array.isArray(payload)
          ? payload
          : (payload?.data as unknown[]) || [];
        const normalized = list.map((item, index) =>
          normalizeBooking(item, index)
        );
        if (!cancelled) {
          setRegistrations(normalized);
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Unable to load bookings.";
        setError(message);
        setRegistrations([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [refreshKey]);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <main className="min-h-screen bg-[#f6f5ff] px-4 py-12">
      <section className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8a80bb]">
            Dashboard
          </p>
          <h1 className="text-4xl font-extrabold text-[#1f1b4b]">Dashboard</h1>
          <p className="text-lg text-[#7c72a4]">
            Welcome back, {userName}! Here you can manage your event
            registrations.
          </p>
        </header>

        <div className="rounded-3xl border border-[#ebe7fb] bg-white shadow-[0_25px_70px_rgba(106,78,198,0.08)]">
          <div className="border-b border-[#f0edff] px-8 py-6">
            <h2 className="text-2xl font-semibold text-[#1f1b4b]">
              My Registered Events
            </h2>
            <p className="mt-1 text-sm text-[#8a80bb]">
              Review upcoming registrations and manage your seats.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {loading && <span className="text-[#7c72a4]">Loading...</span>}
              {error && (
                <>
                  <span className="text-red-500">{error}</span>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="rounded-lg border border-[#d8d2fb] px-3 py-1 text-xs font-semibold text-[#4a3cff]"
                  >
                    Try again
                  </button>
                </>
              )}
              {!loading && !error && (
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="rounded-lg border border-transparent px-3 py-1 text-xs font-semibold text-[#4a3cff] hover:underline"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="px-8 py-12 text-center text-[#8a80bb]">
              Fetching your bookings...
            </div>
          ) : registrations.length > 0 ? (
            <ul className="divide-y divide-[#f0edff]">
              {registrations.map((event) => (
                <li key={event.id} className="px-8 py-6">
                  <RegistrationCard event={event} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-8 py-12 text-center text-[#8a80bb]">
              You have no registrations yet.
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            className="rounded-2xl bg-[#4a3cff] px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-[#3c31cc]"
          >
            Browse more events
          </button>
        </div>
      </section>
    </main>
  );
}

function RegistrationCard({ event }: { event: RegisteredEvent }) {
  const { month, day, weekday } = getDatePieces(event.date);

  return (
    <article className="flex flex-col gap-6 rounded-2xl border border-[#ede9fb] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-6">
        <div className="text-center text-[#1f1b4b]">
          <p className="text-sm font-bold uppercase text-[#574bff]">{month}</p>
          <p className="text-4xl font-extrabold">{day}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#1f1b4b]">
            {event.title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#7c72a4]">
            <InfoBadge icon={<FaCalendarAlt />} label={weekday} />
            <InfoBadge icon={<FaClock />} label={event.timeslot} />
            <InfoBadge icon={<FaMapMarkerAlt />} label={event.location} />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <span className="text-sm font-medium text-[#7c72a4]">
          Seats booked: {event.seats}
        </span>
        <button
          type="button"
          className="self-start rounded-xl bg-linear-to-r from-[#ff6b6b] to-[#ff4c4c] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-110 sm:self-center"
        >
          Cancel registration
        </button>
      </div>
    </article>
  );
}

function InfoBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[#7c72a4]">
      <span className="text-base text-[#574bff]">{icon}</span>
      {label}
    </span>
  );
}

function getDatePieces(dateInput: string) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return { month: "", day: "", weekday: "" };
  }

  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate().toString().padStart(2, "0");
  const weekday = date.toLocaleString("en-US", { weekday: "long" });
  return { month, day, weekday };
}

function normalizeBooking(raw: unknown, index: number): RegisteredEvent {
  const record = (raw ?? {}) as Record<string, unknown>;
  const eventData = (record?.event as Record<string, unknown>) || record;

  const numberOrOne = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  const fallbackId = eventData?.id ?? record?.eventId ?? record?.id ?? index;
  const title =
    typeof eventData?.title === "string" && eventData.title.trim()
      ? eventData.title
      : "Untitled event";
  const date =
    typeof eventData?.date === "string" && eventData.date ? eventData.date : "";
  const location =
    typeof eventData?.location === "string" && eventData.location.trim()
      ? eventData.location
      : "Location TBA";
  const timeslot =
    typeof eventData?.timeslot === "string" && eventData.timeslot.trim()
      ? eventData.timeslot
      : formatTimeLabel(eventData?.date as string | undefined);
  const seats = numberOrOne(
    record?.seats ?? record?.tickets ?? record?.quantity ?? record?.count
  );

  return {
    id: String(fallbackId),
    title,
    date,
    location,
    timeslot,
    seats,
  };
}

function formatTimeLabel(dateInput?: string) {
  if (!dateInput) return "Time TBA";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "Time TBA";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";

export interface EventRecord {
  id: string;
  title: string;
  date: string;
  location: string;
  bookedSeats: number;
  totalSeats: number;
}

interface EventManagementTableProps {
  apiUrl?: string;
}

export default function EventManagementTable({
  apiUrl = "http://localhost:8000/events",
}: EventManagementTableProps) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (typeof window === "undefined") return undefined;

    const getToken = () => {
      try {
        return window.localStorage.getItem("authToken");
      } catch {
        return null;
      }
    };

    const loadEvents = async () => {
      if (cancelled) return;
      const token = getToken();
      if (!token) {
        setError("Please sign in as an admin to view events.");
        setEvents([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const headers: HeadersInit = {};
        if (token && token !== "session") {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, {
          cache: "no-store",
          credentials: "include",
          headers,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch events (${response.status})`);
        }
        const payload = await response.json();
        if (cancelled) return;
        const list: unknown[] = Array.isArray(payload)
          ? payload
          : payload?.data || [];
        setEvents(list.map((item, index) => normalizeEvent(item, index)));
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Unable to load events";
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    const handleAuthChange = () => loadEvents();
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      cancelled = true;
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, [apiUrl]);

  const tableBody = useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td
            colSpan={5}
            className="px-6 py-10 text-center text-[#7a6aa8] text-sm"
          >
            Loading events...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td
            colSpan={5}
            className="px-6 py-10 text-center text-red-500 text-sm"
          >
            {error}
          </td>
        </tr>
      );
    }

    if (!events.length) {
      return (
        <tr>
          <td
            colSpan={5}
            className="px-6 py-10 text-center text-[#7a6aa8] text-sm"
          >
            No events to display yet.
          </td>
        </tr>
      );
    }

    return events.map((event) => (
      <tr key={event.id} className="border-b border-[#f1eefc] last:border-0">
        <td className="px-6 py-4 text-[#2d2a6a] font-medium">{event.title}</td>
        <td className="px-6 py-4 text-sm text-[#6c63a8]">
          {formatDate(event.date)}
        </td>
        <td className="px-6 py-4 text-sm text-[#6c63a8]">
          {event.location || "—"}
        </td>
        <td className="px-6 py-4 text-sm text-[#2d2a6a]">
          {event.bookedSeats}/{event.totalSeats || "—"}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <IconButton label="View event" variant="primary">
              <FiEye />
            </IconButton>
            <IconButton label="Edit event" variant="primary">
              <FiEdit2 />
            </IconButton>
            <IconButton label="Delete event" variant="danger">
              <FiTrash2 />
            </IconButton>
          </div>
        </td>
      </tr>
    ));
  }, [error, events, loading]);

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#f1eefc]">
          <thead>
            <tr className="text-left text-sm text-[#7a6aa8]">
              <th className="px-6 py-4 font-semibold tracking-wide">Title</th>
              <th className="px-6 py-4 font-semibold tracking-wide">Date</th>
              <th className="px-6 py-4 font-semibold tracking-wide">
                Location
              </th>
              <th className="px-6 py-4 font-semibold tracking-wide">
                Registrations
              </th>
              <th className="px-6 py-4 font-semibold tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">{tableBody}</tbody>
        </table>
      </div>
    </div>
  );
}

function normalizeEvent(raw: unknown, index: number): EventRecord {
  const record = raw as Record<string, unknown>;
  const numberOrZero = (value: unknown): number => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const bookedSeats = numberOrZero(
    record?.bookedSeats ??
      record?.registrations ??
      record?.booked ??
      record?.soldSeats
  );
  const totalSeats = numberOrZero(
    record?.totalSeats ?? record?.capacity ?? record?.maxSeats
  );

  return {
    id: String(record?.id ?? record?._id ?? index),
    title:
      typeof record?.title === "string" && record.title.trim()
        ? record.title
        : "Untitled event",
    date:
      typeof record?.date === "string" && record.date
        ? record.date
        : (record?.eventDate as string) || "",
    location:
      typeof record?.location === "string"
        ? record.location
        : (record?.city as string) || "",
    bookedSeats,
    totalSeats,
  };
}

interface IconButtonProps {
  children: React.ReactNode;
  label: string;
  variant?: "primary" | "danger";
}

function IconButton({ children, label, variant = "primary" }: IconButtonProps) {
  const base = "p-2 rounded-full text-base transition-colors duration-150";
  const palette =
    variant === "danger"
      ? "text-red-500 hover:bg-red-50"
      : "text-[#2d2a6a] hover:bg-indigo-50";

  return (
    <button type="button" aria-label={label} className={`${base} ${palette}`}>
      {children}
    </button>
  );
}

function formatDate(dateInput: string) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return dateInput;
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

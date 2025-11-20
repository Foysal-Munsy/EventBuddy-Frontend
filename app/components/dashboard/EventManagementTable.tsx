"use client";

import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";

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
  refreshKey?: number;
}

export default function EventManagementTable({
  apiUrl = "http://localhost:8000/events",
  refreshKey = 0,
}: EventManagementTableProps) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem("authToken");
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (typeof window === "undefined") return undefined;

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
    const handleExternalUpdate = () => loadEvents();
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("eventsUpdated", handleExternalUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("eventsUpdated", handleExternalUpdate);
    };
  }, [apiUrl, refreshKey]);

  const handleDelete = async (eventId: string, title: string) => {
    const confirmation = await Swal.fire({
      title: `Delete ${title}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) return;

    const token = getToken();
    if (!token) {
      await Swal.fire({
        title: "Not authorized",
        text: "Please sign in as an admin before deleting events.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    setDeletingId(eventId);
    try {
      const headers: HeadersInit = {};
      if (token !== "session") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:8000/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          payload?.detail || payload?.message || "Failed to delete event";
        throw new Error(message);
      }

      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      window.dispatchEvent(new Event("eventsUpdated"));

      await Swal.fire({
        title: "Event deleted",
        text: `${title} has been removed successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete event";
      await Swal.fire({
        title: "Deletion failed",
        text: message,
        icon: "error",
        confirmButtonText: "Close",
      });
    } finally {
      setDeletingId(null);
    }
  };

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
            <IconButton
              label="Delete event"
              variant="danger"
              onClick={() => handleDelete(event.id, event.title)}
              disabled={deletingId === event.id}
            >
              <FiTrash2 />
            </IconButton>
          </div>
        </td>
      </tr>
    ));
  }, [deletingId, error, events, loading]);

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
  onClick?: () => void;
  disabled?: boolean;
}

function IconButton({
  children,
  label,
  variant = "primary",
  onClick,
  disabled,
}: IconButtonProps) {
  const base =
    "p-2 rounded-full text-base transition-colors duration-150 focus:outline-none";
  const palette =
    variant === "danger"
      ? "text-red-500 hover:bg-red-50"
      : "text-[#2d2a6a] hover:bg-indigo-50";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${palette} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
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

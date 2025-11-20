"use client";

import type { ReactNode } from "react";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";

type RegisteredEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  timeslot: string;
};

interface UserDashboardProps {
  userName?: string;
  registrations?: RegisteredEvent[];
}

// Placeholder data so the layout resembles the provided design.
const mockRegistrations: RegisteredEvent[] = [
  {
    id: "1",
    title: "Tech Conference 2025",
    date: "2025-04-14T15:00:00.000Z",
    location: "San Francisco, CA",
    timeslot: "3-5 PM",
  },
  {
    id: "2",
    title: "Tech Conference 2025",
    date: "2025-04-14T15:00:00.000Z",
    location: "San Francisco, CA",
    timeslot: "3-5 PM",
  },
];

export default function UserDashboard({
  userName = "Alif",
  registrations = mockRegistrations,
}: UserDashboardProps) {
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
          </div>

          {registrations.length > 0 ? (
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

      <button
        type="button"
        className="self-start rounded-xl bg-linear-to-r from-[#ff6b6b] to-[#ff4c4c] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-110 sm:self-center"
      >
        Cancel registration
      </button>
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

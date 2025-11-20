"use client";

import { useState } from "react";
import EventManagementTable, { type EventRecord } from "./EventManagementTable";
import CreateEventModal from "./CreateEventModal";
import EditEventModal from "./EditEventModal";

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);

  const handleCloseModal = () => setIsModalOpen(false);
  const handleEventCreated = () => {
    setIsModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEventUpdated = () => {
    setEditingEvent(null);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-[#f4f3ff] py-12 px-4 sm:px-8">
      <section className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-[#a29ccf]">
            Admin
          </p>
          <h1 className="text-4xl font-extrabold text-[#2d2a6a]">
            Admin Dashboard
          </h1>
          <p className="text-lg text-[#7a6aa8]">
            Manage events, view registrations, and monitor your platform.
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-[#ece7f8]">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-[#f1eefc]">
            <div>
              <h2 className="text-xl font-semibold text-[#2d2a6a]">
                Events Management
              </h2>
            </div>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
              style={{
                backgroundImage: "linear-gradient(135deg, #5b61ff, #376bff)",
              }}
              onClick={() => setIsModalOpen(true)}
            >
              Create Event
            </button>
          </div>
          <EventManagementTable
            refreshKey={refreshKey}
            onEdit={(event) => setEditingEvent(event)}
          />
        </div>
      </section>

      <CreateEventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreated={handleEventCreated}
      />
      <EditEventModal
        isOpen={Boolean(editingEvent)}
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onUpdated={handleEventUpdated}
      />
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { MdEventSeat } from "react-icons/md";

interface EventSeatSelectorProps {
  maxSeats: number;
  bookingDisabled?: boolean;
}

export default function EventSeatSelector({
  maxSeats,
  bookingDisabled = false,
}: EventSeatSelectorProps) {
  const normalized = Math.max(0, Math.floor(maxSeats));
  const seatOptions = useMemo(() => {
    if (normalized <= 0) return [];
    const limit = Math.max(1, Math.min(4, normalized));
    return Array.from({ length: limit }, (_, index) => index + 1);
  }, [normalized]);

  const [selected, setSelected] = useState(() => seatOptions[0] ?? 0);
  const disabled = seatOptions.length === 0;

  if (disabled) {
    return (
      <section className="rounded-3xl border border-[#ebe7fb] bg-white p-8 text-center shadow-[0_25px_70px_rgba(106,78,198,0.08)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f3ff] text-3xl text-[#6a4ec6]">
          <MdEventSeat />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-[#2d2a6a]">
          Seats unavailable
        </h2>
        <p className="mt-2 text-sm text-[#8a7ead]">
          All seats for this event are booked. Please check back later.
        </p>
      </section>
    );
  }

  const bookLabel = bookingDisabled
    ? "Booking unavailable"
    : `Book ${selected} Seat${selected === 1 ? "" : "s"}`;

  return (
    <section className="rounded-3xl border border-[#ebe7fb] bg-white p-8 shadow-[0_25px_70px_rgba(106,78,198,0.08)]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#2d2a6a]">
          Select Number of Seats
        </h2>
        <span className="text-sm font-medium text-[#8a7ead]">
          Max {normalized} total seats
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {seatOptions.map((count) => {
          const isSelected = count === selected;
          return (
            <button
              key={count}
              type="button"
              onClick={() => setSelected(count)}
              className={`flex flex-col rounded-2xl border px-6 py-5 text-left shadow-sm transition hover:shadow-md ${
                isSelected
                  ? "border-[#6a4ec6] bg-[#f4f3ff] text-[#2d2a6a]"
                  : "border-[#eee9ff] bg-white text-[#6f6593]"
              }`}
            >
              <div className="flex items-center gap-3 text-xl font-semibold">
                <span className="rounded-full bg-white p-3 text-[#6a4ec6] shadow-inner">
                  <MdEventSeat />
                </span>
                {count} {count === 1 ? "Seat" : "Seats"}
              </div>
              <p className="mt-2 text-sm text-[#8a7ead]">
                Reserve {count} attendee{count === 1 ? "" : "s"}
              </p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={bookingDisabled}
        className={`mt-6 w-full rounded-2xl py-4 text-lg font-semibold text-white shadow-lg transition ${
          bookingDisabled
            ? "bg-[#a8a5bf] cursor-not-allowed"
            : "bg-[#5b61ff] hover:bg-[#4a50e6]"
        }`}
      >
        {bookLabel}
      </button>

      {bookingDisabled && (
        <p className="mt-3 text-center text-sm text-[#8a7ead]">
          This event is no longer accepting new bookings.
        </p>
      )}
    </section>
  );
}

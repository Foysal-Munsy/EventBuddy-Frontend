"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MdEventSeat } from "react-icons/md";
import Swal from "sweetalert2";

interface EventSeatSelectorProps {
  eventId: string;
  maxSeats: number;
  bookedSeats?: number;
  bookingDisabled?: boolean;
}

export default function EventSeatSelector({
  eventId,
  maxSeats,
  bookedSeats = 0,
  bookingDisabled = false,
}: EventSeatSelectorProps) {
  const router = useRouter();
  const takenSeats = Math.max(0, Math.floor(bookedSeats));
  const availableSeats = Math.max(0, Math.floor(maxSeats) - takenSeats);

  const seatOptions = useMemo(() => {
    if (availableSeats <= 0) return [];
    const upperBound = Math.min(4, availableSeats);
    return Array.from({ length: upperBound }, (_, index) => index + 1);
  }, [availableSeats]);

  const [selected, setSelected] = useState(() => seatOptions[0] ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const noSeatsLeft = seatOptions.length === 0;

  useEffect(() => {
    if (!seatOptions.length) {
      setSelected(0);
      return;
    }
    if (!seatOptions.includes(selected)) {
      setSelected(seatOptions[0] ?? 0);
    }
  }, [seatOptions, selected]);

  const hasUserSession = () => {
    if (typeof window === "undefined") return false;
    try {
      const token = window.localStorage.getItem("authToken");
      const user = window.localStorage.getItem("user");
      return Boolean(token || user);
    } catch {
      return false;
    }
  };

  const promptAuth = async () => {
    await Swal.fire({
      title: "Sign in required",
      html:
        `You need to be signed in to book seats.<br/><br/>` +
        `<a href="/signin" class="text-[#5b61ff] font-semibold">Sign in</a> or ` +
        `<a href="/signup" class="text-[#5b61ff] font-semibold">Create an account</a>.`,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  const handleBooking = async () => {
    if (bookingDisabled || noSeatsLeft || submitting) return;

    if (!hasUserSession()) {
      await promptAuth();
      return;
    }

    const maxSelectable = Math.min(4, availableSeats);
    const prompt = await Swal.fire({
      title: "How many seats do you want to book? (1-4)",
      input: "number",
      inputValue: selected || seatOptions[0] || 1,
      inputAttributes: {
        min: "1",
        max: String(maxSelectable),
      },
      showCancelButton: true,
      confirmButtonText: "Confirm booking",
      cancelButtonText: "Cancel",
      focusConfirm: false,
      preConfirm: (value) => {
        const seats = Number(value);
        if (!Number.isInteger(seats) || seats < 1 || seats > maxSelectable) {
          Swal.showValidationMessage(
            `Enter a number between 1 and ${maxSelectable}.`
          );
          return false;
        }
        return seats;
      },
    });

    if (!prompt.isConfirmed) return;
    const seatsToBook = Number(prompt.value);
    if (!Number.isInteger(seatsToBook)) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `http://localhost:8000/events/${encodeURIComponent(eventId)}/book`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ seats: seatsToBook }),
        }
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          payload?.message ||
          payload?.detail ||
          `Unable to book ${seatsToBook} seat(s).`;
        await Swal.fire({
          title: "Booking failed",
          text: message,
          icon: "error",
          confirmButtonText: "Close",
        });
        return;
      }

      await Swal.fire({
        title: "Booking confirmed",
        text:
          payload?.message ||
          `Successfully booked ${seatsToBook} seat${
            seatsToBook === 1 ? "" : "s"
          }.`,
        icon: "success",
        confirmButtonText: "Great",
      });
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      await Swal.fire({
        title: "Booking failed",
        text: message,
        icon: "error",
        confirmButtonText: "Close",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (noSeatsLeft) {
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

  const bookLabel = bookingDisabled ? "Booking unavailable" : "Book Now";

  return (
    <section className="rounded-3xl border border-[#ebe7fb] bg-white p-8 shadow-[0_25px_70px_rgba(106,78,198,0.08)]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#2d2a6a]">
          Select Number of Seats
        </h2>
        <span className="text-sm font-medium text-[#8a7ead]">
          {availableSeats} seat{availableSeats === 1 ? "" : "s"} available
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
        disabled={bookingDisabled || submitting}
        onClick={handleBooking}
        className={`mt-6 w-full rounded-2xl py-4 text-lg font-semibold text-white shadow-lg transition ${
          bookingDisabled || submitting
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

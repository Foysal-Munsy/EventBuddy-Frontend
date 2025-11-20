"use client";

import Image from "next/image";
import { useState, type FormEvent, type ReactNode } from "react";
import Swal from "sweetalert2";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormState {
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  totalSeats: string;
}

const emptyForm: FormState = {
  title: "",
  date: "",
  time: "",
  description: "",
  location: "",
  totalSeats: "",
};

const inputClasses =
  "w-full px-4 py-3 rounded-xl border border-[#ece7f8] bg-[#fbfbfd] text-sm text-[#2d2a6a] outline-none focus:ring-2 focus:ring-[#c4bcff]";

export default function CreateEventModal({
  isOpen,
  onClose,
  onCreated,
}: CreateEventModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  const imgbbEnabled = Boolean(imgbbKey);

  const resetState = () => {
    setForm(emptyForm);
    setImageFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const closeModal = () => {
    if (submitting) return;
    resetState();
    onClose();
  };

  const handleInput = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files?.length) {
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }
    const file = files[0];
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const uploadImage = async () => {
    if (!imageFile || !imgbbKey) return null;
    const base64 = await fileToBase64(imageFile);
    const payload = new FormData();
    payload.append("image", base64.split(",")[1] ?? base64);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
      method: "POST",
      body: payload,
    });
    const json = await res.json();
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || "Image upload failed");
    }
    return json?.data?.url as string;
  };

  const buildHeaders = (token: string | null) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token && token !== "session") {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("You must be signed in to create an event.");
      }

      const isoDate = combineDateTime(form.date, form.time);
      if (!isoDate) {
        throw new Error("Please provide a valid date (and optional time).");
      }

      if (!form.totalSeats) {
        throw new Error("Total seats is required.");
      }
      const seatsValue = Number(form.totalSeats);
      if (!Number.isFinite(seatsValue)) {
        throw new Error("Total seats must be a number.");
      }

      let imageUrl: string | null = null;
      if (imageFile && imgbbEnabled) {
        imageUrl = await uploadImage();
      }

      const response = await fetch("http://localhost:8000/events/create", {
        method: "POST",
        credentials: "include",
        headers: buildHeaders(token),
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          location: form.location,
          date: isoDate,
          totalSeats: seatsValue,
          imageUrl: imageUrl ?? "",
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          payload?.detail || payload?.message || "Failed to create event";
        throw new Error(message);
      }

      window.dispatchEvent(new Event("eventsUpdated"));

      await Swal.fire({
        title: "Event created",
        text: "Your event has been added successfully.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      onCreated();
      resetState();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create event";
      setError(message);
      await Swal.fire({
        title: "Could not create event",
        text: message,
        icon: "error",
        confirmButtonText: "Got it",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-4xl w-full max-w-3xl shadow-2xl border border-[#ece7f8]">
        <div className="flex items-start justify-between px-8 pt-6 pb-4 border-b border-[#f1eefc]">
          <div>
            <h3 className="text-2xl font-bold text-[#2d2a6a]">
              Create New Event
            </h3>
            <p className="text-sm text-[#7a6aa8] mt-1">
              Manage every detail before publishing your event.
            </p>
          </div>
          <button
            type="button"
            className="text-2xl text-[#7a6aa8] hover:text-[#2d2a6a]"
            onClick={closeModal}
            aria-label="Close create event modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-5">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid gap-4">
            <Field label="Title">
              <input
                type="text"
                className={inputClasses}
                placeholder="Enter event title"
                value={form.title}
                required
                onChange={(e) => handleInput("title", e.target.value)}
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Date">
                <input
                  type="date"
                  className={inputClasses}
                  value={form.date}
                  required
                  onChange={(e) => handleInput("date", e.target.value)}
                />
              </Field>
              <Field label="Time">
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="e.g. 09:00 AM - 11:00 AM"
                  value={form.time}
                  onChange={(e) => handleInput("time", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                rows={4}
                className={`${inputClasses} resize-none`}
                placeholder="Describe your event"
                value={form.description}
                onChange={(e) => handleInput("description", e.target.value)}
              />
            </Field>

            <Field label="Event Location">
              <input
                type="text"
                className={inputClasses}
                placeholder="Enter location"
                value={form.location}
                onChange={(e) => handleInput("location", e.target.value)}
              />
            </Field>

            <Field label="Total Seats">
              <input
                type="number"
                min={0}
                className={inputClasses}
                placeholder="Enter total available seats"
                value={form.totalSeats}
                required
                onChange={(e) => handleInput("totalSeats", e.target.value)}
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-4 items-end">
              <div>
                <p className="text-sm font-semibold text-[#2d2a6a] mb-2">
                  Image
                </p>
                <label className="block border-2 border-dashed border-[#d8d2fb] rounded-2xl p-4 text-center cursor-pointer hover:border-[#b5aef3] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files)}
                  />
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Selected event"
                      width={320}
                      height={128}
                      unoptimized
                      className="mx-auto h-32 w-full object-cover rounded-xl"
                    />
                  ) : (
                    <>
                      <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-[#f4f3ff] flex items-center justify-center text-[#6b4bff] text-xl">
                        ↑
                      </div>
                      <p className="text-sm text-[#2d2a6a]">
                        Drag or <span className="text-[#6b4bff]">upload</span>{" "}
                        the picture here
                      </p>
                      <p className="text-xs text-[#7a6aa8] mt-1">
                        Max 5MB | JPG, PNG
                      </p>
                    </>
                  )}
                </label>
              </div>
              <div className="text-sm text-[#7a6aa8] space-y-2">
                <p>
                  {imgbbEnabled
                    ? "Images will be uploaded to your Imgbb storage."
                    : "Set NEXT_PUBLIC_IMGBB_API_KEY to enable automatic image uploads."}
                </p>
                {previewUrl && (
                  <button
                    type="button"
                    className="text-[#6b4bff] font-semibold"
                    onClick={() => handleFileChange(null)}
                  >
                    Remove selected image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-3 rounded-xl text-[#7a6aa8] font-semibold bg-[#f6f5ff] hover:bg-[#ece9ff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl text-white font-semibold shadow-lg disabled:opacity-70"
              style={{
                backgroundImage: "linear-gradient(135deg, #5b61ff, #376bff)",
              }}
            >
              {submitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <label className="block text-sm text-[#2d2a6a] font-semibold space-y-2">
      <span>{label}</span>
      {children}
    </label>
  );
}

function combineDateTime(dateStr: string, timeStr: string) {
  if (!dateStr) return null;
  const sanitizedTime = parseTimeTo24h(timeStr);
  const composed = sanitizedTime ? `${dateStr}T${sanitizedTime}` : dateStr;
  const date = new Date(composed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function parseTimeTo24h(input: string) {
  if (!input) return "00:00";
  const segment = input.split("-")[0]?.trim();
  if (!segment) return "00:00";

  const twentyFourMatch = segment.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (twentyFourMatch) {
    const [, h, m] = twentyFourMatch;
    return `${h.padStart(2, "0")}:${m}`;
  }

  const twelveHourMatch = segment.match(/^([0-1]?\d):([0-5]\d)\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    let hour = parseInt(twelveHourMatch[1], 10);
    const minute = twelveHourMatch[2];
    const meridiem = twelveHourMatch[3].toUpperCase();
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  }

  return segment;
}

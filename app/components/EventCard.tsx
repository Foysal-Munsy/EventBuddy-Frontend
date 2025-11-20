"use client";

import Link from "next/link";
import React from "react";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";

export interface EventCardProps {
  id: string | number;
  title: string;
  description?: string;
  date: string; // ISO string expected
  location?: string;
  totalSeats?: number;
  bookedSeats?: number;
  imageUrl?: string;
  tags?: string[];
}

export default function EventCard({
  id,
  title,
  description = "",
  date,
  location = "",
  totalSeats = 0,
  bookedSeats = 0,
  imageUrl,
  tags = ["Tech", "Conference", "Ai"],
}: EventCardProps) {
  const d = new Date(date);
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = d.getDate();
  const weekday = d.toLocaleString("en-US", { weekday: "long" });
  const time = d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const spotsLeft = Math.max(0, (totalSeats || 0) - (bookedSeats || 0));

  return (
    <Link
      href={`/events/${encodeURIComponent(String(id))}`}
      className="group block focus:outline-none"
      aria-label={`View details for ${title}`}
    >
      <article className="relative overflow-hidden rounded-tr-lg rounded-bl-lg rounded-br-[48px] rounded-tl-[48px] border border-[rgba(133,112,173,0.06)] bg-white shadow-[0_8px_30px_rgba(133,112,173,0.12)] transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
        {/* top-left cut */}
        <div
          className="absolute -top-4 -left-4 h-10 w-10 rotate-45 bg-white shadow-sm"
          aria-hidden
        />

        <div className="relative">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              className="h-52 w-full object-cover"
            />
          ) : (
            <div className="flex h-52 w-full items-center justify-center bg-gray-100 text-gray-400">
              No image
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 text-center">
              <div className="text-xs font-bold text-indigo-600">{month}</div>
              <div className="text-xl font-extrabold text-gray-900">{day}</div>
            </div>
            <h3 className="text-2xl font-semibold leading-tight text-[#231F48]">
              {title}
            </h3>
          </div>
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
            {description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2 text-sm text-[#8570AD]">
              <FaCalendarAlt />
              <span>{weekday}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#8570AD]">
              <FaClock />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#8570AD]">
              <FaMapMarkerAlt />
              <span>{location}</span>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-[#F1F2FF] px-3 py-1 text-sm text-[#5647D6]"
                >
                  • {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-[rgba(133,112,173,0.06)] pt-4 text-sm text-[#8570AD]">
            <div className="flex items-center gap-2">
              <MdEventSeat className="text-[#8570AD]" />
              <span className="font-medium text-[#6B577F]">
                {spotsLeft} Spots Left
              </span>
            </div>

            <div className="text-right text-[#8570AD]">
              Total {totalSeats} Seats
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

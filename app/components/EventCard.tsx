"use client";

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
  tags?: ["tech", "conference", "ai"];
}

export default function EventCard({
  title,
  description = "",
  date,
  location = "",
  totalSeats = 0,
  bookedSeats = 0,
  imageUrl,
  tags = ["tech", "conference", "ai"],
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
    <article className="bg-white rounded rounded-tl-[50px] rounded-br-[50px] shadow-md overflow-hidden border border-gray-100">
      <div className="relative">
        {imageUrl ? (
          // image
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="p-6 pt-10">
        <div className="flex gap-1 items-center">
          <div className="px-3">
            <div className="text-xs text-indigo-600 font-bold">{month}</div>
            <div className="text-xl font-extrabold text-gray-900">{day}</div>
          </div>
          <h3 className="text-2xl font-semibold text-indigo-900">{title}</h3>
        </div>
        <p className="mt-2 text-gray-600 line-clamp-3">{description}</p>

        <div className="mt-4 flex items-center text-gray-600 space-x-4">
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-[#8570AD]" />
            <span className="text-sm">{weekday}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaClock className="text-[#8570AD]" />
            <span className="text-sm">{time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaMapMarkerAlt className="text-[#8570AD]" />
            <span className="text-sm">{location}</span>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="text-sm bg-[#DADEFF] text-[#1D4ED8] px-3 py-1 rounded-lg"
              >
                • {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm text-[#8570AD]">
          <div className="flex items-center space-x-2">
            <MdEventSeat />
            <span>{spotsLeft} Spots Left</span>
          </div>

          <div className="text-right text-[#8570AD]">
            Total {totalSeats} Seats
          </div>
        </div>
      </div>
    </article>
  );
}

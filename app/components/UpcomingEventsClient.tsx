"use client";

import React, { useMemo, useState } from "react";
import EventCard, { EventCardProps } from "./EventCard";

type Props = {
  posts: EventCardProps[];
};

export default function UpcomingEventsClient({ posts }: Props) {
  const pageSize = 3;
  const [page, setPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(posts.length / pageSize)),
    [posts.length]
  );

  const start = (page - 1) * pageSize;
  const pageItems = posts.slice(start, start + pageSize);

  function goto(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl mt-4 font-semibold text-indigo-900 mb-6">
        Upcoming Events
      </h2>

      {posts.length === 0 ? (
        <div className="text-gray-600">No upcoming events.</div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            {pageItems.map((post) => (
              <EventCard
                key={post.id}
                title={post.title}
                description={post.description}
                date={post.date}
                location={post.location}
                totalSeats={post.totalSeats}
                bookedSeats={post.bookedSeats}
                imageUrl={post.imageUrl}
                tags={post.tags}
              />
            ))}
          </div>

          {posts.length > pageSize && (
            <div className="mt-8 flex items-center justify-center space-x-3">
              <button
                onClick={() => goto(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 rounded-md bg-white border text-sm disabled:opacity-50"
              >
                Prev
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => goto(p)}
                      className={`px-3 py-2 rounded-md text-sm ${
                        p === page
                          ? "bg-indigo-600 text-white"
                          : "bg-white border"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goto(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-md bg-white border text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

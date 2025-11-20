import Link from "next/link";
import { notFound } from "next/navigation";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import { MdEventSeat } from "react-icons/md";
import EventSeatSelector from "../../components/EventSeatSelector";

interface EventDetail {
  id: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  totalSeats: number;
  bookedSeats: number;
  imageUrl?: string;
  tags?: string[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const DEFAULT_TAGS = ["Tech", "Conference", "All"] as const;

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await fetchEvent(id);
  if (!event) notFound();

  const { dateLabel, timeLabel } = formatDateParts(event.date);
  const tags = event.tags && event.tags.length ? event.tags : DEFAULT_TAGS;
  const spotsLeft = Math.max(event.totalSeats - event.bookedSeats, 0);
  const bookingClosed = isPastDate(event.date);

  return (
    <div className="min-h-screen bg-[#f6f5ff] pb-16 pt-10">
      <div className="mx-auto max-w-5xl px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5b61ff] transition hover:text-[#443abf]"
        >
          <FiArrowLeft /> Back to events
        </Link>

        <article className="mt-6 overflow-hidden rounded-4xl border border-[#ece7f8] bg-white shadow-[0_25px_80px_rgba(86,71,214,0.08)]">
          <EventHero imageUrl={event.imageUrl} title={event.title} />

          <div className="space-y-8 p-8">
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#eef0ff] px-4 py-1 text-sm font-semibold text-[#5b61ff]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <header>
              <h1 className="text-3xl font-bold text-[#1f1b4b] md:text-4xl">
                {event.title}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-[#6c6397]">
                {event.description ||
                  "Details for this event will be shared soon."}
              </p>
            </header>

            <InfoRow
              dateLabel={dateLabel}
              timeLabel={timeLabel}
              location={event.location || "Location to be announced"}
            />

            <EventSeatSelector
              eventId={event.id}
              maxSeats={event.totalSeats}
              bookedSeats={event.bookedSeats}
              bookingDisabled={bookingClosed}
            />

            <section>
              <h2 className="text-2xl font-semibold text-[#1f1b4b]">
                About this event
              </h2>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-[#5a5578]">
                {event.description ||
                  "This event information is being finalized."}
              </p>
            </section>

            <footer className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#f7f5ff] px-5 py-4 text-[#5a4c85]">
              <div className="flex items-center gap-2 text-lg font-semibold text-[#46397d]">
                <MdEventSeat className="text-2xl" />
                {spotsLeft} Spots Left
              </div>
              <span className="text-sm text-[#8f83b6]">
                ({event.bookedSeats} registered)
              </span>
              {bookingClosed && (
                <span className="text-sm font-semibold text-[#c25e5e]">
                  Booking closed for this event.
                </span>
              )}
            </footer>
          </div>
        </article>
      </div>
    </div>
  );
}

function EventHero({ imageUrl, title }: { imageUrl?: string; title: string }) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={title} className="h-80 w-full object-cover" />
    );
  }

  return (
    <div className="flex h-80 w-full items-center justify-center bg-[#f1efff] text-[#a49cd4]">
      No image available
    </div>
  );
}

function InfoRow({
  dateLabel,
  timeLabel,
  location,
}: {
  dateLabel: string;
  timeLabel: string;
  location: string;
}) {
  const pill =
    "flex items-center gap-3 rounded-2xl border border-[#f0edff] bg-[#faf9ff] px-5 py-4 text-sm font-medium text-[#554c7c]";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className={pill}>
        <FaCalendarAlt className="text-[#5b61ff]" />
        <div>
          <p className="text-xs uppercase tracking-wide text-[#9a92c5]">Date</p>
          <p>{dateLabel}</p>
        </div>
      </div>
      <div className={pill}>
        <FaClock className="text-[#5b61ff]" />
        <div>
          <p className="text-xs uppercase tracking-wide text-[#9a92c5]">Time</p>
          <p>{timeLabel}</p>
        </div>
      </div>
      <div className={pill}>
        <FaMapMarkerAlt className="text-[#5b61ff]" />
        <div>
          <p className="text-xs uppercase tracking-wide text-[#9a92c5]">
            Location
          </p>
          <p>{location}</p>
        </div>
      </div>
    </div>
  );
}

async function fetchEvent(id: string): Promise<EventDetail | null> {
  const baseUrl =
    process.env.BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";
  const response = await fetch(`${baseUrl}/events/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load event (${response.status})`);
  }

  const payload = await response.json().catch(() => null);
  if (!payload) return null;

  const container = payload as Record<string, unknown>;
  const record =
    (container?.data as Record<string, unknown> | undefined) ?? container;

  return normalizeEvent(record, id);
}

function normalizeEvent(record: unknown, fallbackId: string): EventDetail {
  const raw = (record ?? {}) as Record<string, unknown>;
  const numberOrZero = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return {
    id: String(raw?.id ?? raw?._id ?? fallbackId),
    title:
      typeof raw?.title === "string" && raw.title.trim()
        ? raw.title
        : "Untitled event",
    description:
      typeof raw?.description === "string" && raw.description.trim()
        ? raw.description
        : "",
    date:
      typeof raw?.date === "string"
        ? raw.date
        : (raw?.eventDate as string) || undefined,
    location:
      typeof raw?.location === "string" && raw.location.trim()
        ? raw.location
        : undefined,
    totalSeats: numberOrZero(raw?.totalSeats ?? raw?.capacity ?? raw?.maxSeats),
    bookedSeats: numberOrZero(
      raw?.bookedSeats ?? raw?.registrations ?? raw?.soldSeats ?? raw?.booked
    ),
    imageUrl:
      typeof raw?.imageUrl === "string" && raw.imageUrl.trim()
        ? raw.imageUrl
        : undefined,
    tags: Array.isArray(raw?.tags) ? (raw?.tags as string[]) : undefined,
  };
}

function formatDateParts(dateInput?: string) {
  if (!dateInput) {
    return {
      dateLabel: "Date to be announced",
      timeLabel: "Time to be announced",
    };
  }

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: dateInput, timeLabel: "Time to be announced" };
  }

  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const timeLabel = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return { dateLabel, timeLabel };
}

function isPastDate(dateInput?: string) {
  if (!dateInput) return false;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

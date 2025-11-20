import Image from "next/image";
import { CiSearch } from "react-icons/ci";

export default function Hero() {
  const ticket = "https://i.ibb.co.com/LzKCJ7Qx/left-hero-ticket.png";

  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* left + right tickets */}
      <div className="pointer-events-none">
        <div className="hidden md:block absolute left-8 top-8 w-56 -rotate-12 opacity-95 drop-shadow-xl">
          <Image
            src={ticket}
            alt="left ticket"
            width={360}
            height={180}
            unoptimized
          />
        </div>
        <div className="hidden md:block absolute right-8 top-8 w-56 rotate-12 opacity-95 drop-shadow-xl">
          <Image
            src={ticket}
            alt="right ticket"
            width={360}
            height={180}
            unoptimized
          />
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <p className="text-[36px] md:text-[78px] font-semibold text-[#250A63]">
          Discover
        </p>

        <p className="leading-tight text-[36px] md:text-[78px] font-semibold">
          <span className="text-[#4157FE]">Amazing</span>{" "}
          <span className="text-[#250A63]">Events</span>
        </p>

        <p className="mt-6 text-lg md:text-xl text-[#250A63] max-w-3xl mx-auto">
          Find and book events that match your interests. From tech conferences
          to music festivals, we&apos;ve got you covered.
        </p>

        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm w-full max-w-2xl">
            <CiSearch size={24} className="text-gray-400 mr-3" />

            <input
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              placeholder="Search events"
              aria-label="Search events"
            />
          </div>

          <button
            className="rounded-xl px-4 py-3 font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 
             w-full sm:w-auto text-sm sm:text-base"
            style={{ backgroundImage: "var(--btn-gradient)" }}
          >
            Search Events
          </button>
        </div>
      </div>
    </section>
  );
}

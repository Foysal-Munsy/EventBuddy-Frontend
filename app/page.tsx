import Hero from "./components/Hero";
import PreviousEvents from "./components/PreviousEvents";
import UpcomingEvents from "./components/UpcomingEvents";

export default function Home() {
  return (
    <div className="">
      <Hero />
      <UpcomingEvents />
      <div className="m-8">
        <PreviousEvents />
      </div>
    </div>
  );
}

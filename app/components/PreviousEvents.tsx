import { configDotenv } from "dotenv";
import React from "react";
import UpcomingEventsClient from "./UpcomingEventsClient";
configDotenv();

export default async function PreviousEvents() {
  const data = await fetch(`${process.env.BASE_URL}/events/previous`);
  const posts = await data.json();
  return <UpcomingEventsClient posts={posts} title="Previous Events" />;
}

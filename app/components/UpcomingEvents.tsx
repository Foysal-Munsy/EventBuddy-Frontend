import { configDotenv } from "dotenv";
import React from "react";
import UpcomingEventsClient from "./UpcomingEventsClient";
configDotenv();

export default async function UpcomingEvents() {
  const data = await fetch(`${process.env.BASE_URL}/events/upcoming`);
  const posts = await data.json();
  return <UpcomingEventsClient posts={posts} />;
}

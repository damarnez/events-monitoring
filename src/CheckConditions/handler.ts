import Redis from "../utils/redis";
const EVENT_NAME = "events-monitoring-dev-checkconditions";

const URL = process.env.REDIS_URL || "";
const redis = new Redis(URL);
export const check = (events: string[]) => {
  const watcher = redis.getAll("watcher:*");
  console.log("Conditions:", watcher, " counters to check ", events);
};

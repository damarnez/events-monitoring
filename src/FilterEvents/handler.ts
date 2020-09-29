import RedisClient from "../utils/redis";
import Lambda from "../utils/lambda";
import { Block, Match } from "../utils/types";
const EVENT_NAME = "events-monitoring-dev-checkconditions";

const URL = process.env.URL_REDIS || "";
const redis: any = new RedisClient(URL);

export const filter = async (events: Block[]) => {
  // watchers [address,signature,id,condition, email]
  const watchers: string[][] = await redis.getIndexed("watchers");

  const maches: Match[] = [];
  // Search blocks
  for (const log of events) {
    // Check all the watchers
    for (const watcher of watchers) {
      if (
        !log.removed &&
        watcher[0].toLowerCase() === log.address.toLowerCase() &&
        watcher[1].toLowerCase() === log.topics[0].toLowerCase()
      ) {
        const key = `count:${watcher[0]}:${watcher[1]}:${watcher[2]}`;
        try {
          // Update the counters
          await redis.incr(key);
          maches.push({
            blockHash: log.blockHash,
            blockNumber: log.blockNumber,
            address: log.address.toLocaleLowerCase(),
            watcher,
          });
        } catch (error) {
          console.error("ERROR:  ", key, error);
        }
      }
    }
  }

  if (maches && maches.length > 0) {
    const lambda = new Lambda();
    await lambda.invokeEvent(EVENT_NAME, maches);
  } else {
    console.log("[FILTEREVENTS]", "No match in this chunk ");
  }

  return true;
};

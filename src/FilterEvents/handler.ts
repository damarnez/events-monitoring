import RedisClient from "../utils/redis";
import Lambda from "../utils/lambda";
import { Block, Match } from "../utils/types";
const EVENT_NAME = "events-monitoring-dev-checkconditions";

const URL = process.env.URL_REDIS || "";
const redis: any = new RedisClient(URL);

export const filter = async (events: Block[]) => {
  // watchers [address,signature,id,condition]
  const watchers: string[][] = await redis.getIndexed("watchers");
  console.log("[FILTEREVENTS]", " n watchers :", watchers.length);
  // Search blocks
  const maches: Match[] = events.reduce(async (prev: any, log: Block) => {
    // Check all the watchers
    for (let i = 0; i < watchers.length; i++) {
      if (
        !log.removed &&
        watchers[i][0] === log.address &&
        watchers[i][1] === log.topics[0]
      ) {
        const key = `count:${watchers[i][0]}:${watchers[i][1]}:${watchers[i][2]}`;
        try {
          // Update the counters
          await redis.incr(key);
          prev.push({
            blockHash: log.blockHash,
            blockNumber: log.blockNumber,
            address: log.address,
            watcher: watchers[i],
          });
        } catch (error) {
          console.error("Error on increase the counter ", key);
        }
      }
    }
    return prev;
  }, []);

  if (maches && maches.length > 0) {
    console.log(
      "[FilterEvents]",
      " invoke next lambda to check the conditions"
    );
    const lambda = new Lambda();
    await lambda.invokeEvent(EVENT_NAME, maches);
  } else {
    console.log("[FILTEREVENTS]", " No counters to check ");
  }
};

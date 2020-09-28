import RedisClient from "../utils/redis";
import Lambda from "../utils/lambda";
import { Block, Match } from "../utils/types";
const EVENT_NAME = "events-monitoring-dev-checkconditions";

const URL = process.env.URL_REDIS || "";
const redis: any = new RedisClient(URL);

export const filter = async (events: Block[]) => {
  console.log("FILTER EVENTS", events.length);
  // watchers [address,signature,id,condition]
  const watchers: string[][] = await redis.getIndexed("watchers");
  console.log("[FILTEREVENTS]", " n watchers :", watchers.length);
  const maches: Match[] = [];
  // Search blocks
  for (const log of events) {
    console.log("BLOCKNUMBER: ", parseInt(log.blockNumber));
    console.log("TOPIC: ", log.topics[0]);
    console.log("ADDRESS: ", log.address);
    // Check all the watchers
    for (const watcher of watchers) {
      console.log(
        ">>> CHECK  ADDRESS: ",
        watcher[0],
        " === ",
        log.address.toLowerCase()
      );
      console.log(
        "CHECK SIGNATURE: ",
        watcher[1],
        " === ",
        log.topics[0].toLowerCase()
      );
      console.log(
        " CHECK REMOVED ",
        !log.removed,
        " --------------> ",
        log.removed
      );

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
          console.error("Error on increase the counter ", key, error);
        }
      }
    }
  }

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

  return true;
};

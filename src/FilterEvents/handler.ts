import Redis from "../utils/redis";
import { Lambda } from "aws-sdk";
import { Block } from "../types";
const EVENT_NAME = "events-monitoring-dev-checkconditions";

const URL = process.env.REDIS_URL || "";
const redis = new Redis(URL);

export const filter = async (events: Block[]) => {
  const watcher = redis.getAll("watcher:*");

  // Search blocks
  const updatedCounters: string[] = events
    .filter((log: Block) => {
      return (
        !log.removed &&
        watcher.find(
          // Check if has the address and the event is the correct
          (watch) =>
            watch[0] === log.address && watch[1] === log.transactionHash
        )
      );
    })
    .reduce(async (prev: any, log: Block) => {
      // Update the counters
      const key = `${log.address}:${log.transactionHash}`;
      try {
        await redis.incr(key);
        prev.push(key);
      } catch (error) {
        console.error("Error on increase the counter ", key);
      }
      return prev;
    }, []);

  const lambda = new Lambda();

  lambda
    .invoke({
      InvocationType: "Event",
      FunctionName: EVENT_NAME,
      LogType: "None",
      Payload: JSON.stringify(updatedCounters),
    })
    .promise();
};

import RedisClient from "../utils/redis";
import { Lambda } from "aws-sdk";
import { Block } from "../types";
const EVENT_NAME = "events-monitoring-dev-checkconditions";

const URL = process.env.URL_REDIS || "";
const redis: any = new RedisClient(URL);

export const filter = async (events: Block[]) => {
  // watchers [address,signature,condition,id]
  const watchers = await redis.getIndexed("watchers");
  console.log("[FILTEREVENTS]", " n watchers :", watchers.length);
  // Search blocks
  const updatedCounters: string[] = events.reduce(
    async (prev: any, log: Block) => {
      // Check all the watchers
      for (let i = 0; i < watchers.length; i++) {
        if (
          !log.removed &&
          watchers[i][0] === log.address &&
          watchers[i][1] === log.transactionHash
        ) {
          const key = `count:${watchers[i][0]}:${watchers[i][1]}:${watchers[i][2]}`;
          try {
            // Update the counters
            await redis.incr(key);
            prev.push(watchers[i]);
          } catch (error) {
            console.error("Error on increase the counter ", key);
          }
        }
      }
      return prev;
    },
    []
  );

  if (updatedCounters && updatedCounters.length > 0) {
    console.log(
      "[FilterEvents]",
      " invoke next lambda to check the conditions"
    );
    const lambda = new Lambda({
      apiVersion: "2031",
      endpoint: process.env.DEV
        ? "http://localhost:3002"
        : "https://lambda.us-east-1.amazonaws.com",
    });

    lambda
      .invoke({
        InvocationType: "Event",
        FunctionName: EVENT_NAME,
        LogType: "None",
        Payload: JSON.stringify(updatedCounters),
      })
      .promise();
  } else {
    console.log("[FILTEREVENTS]", " No counters to check ");
  }
};

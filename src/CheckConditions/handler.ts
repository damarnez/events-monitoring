import RedisClient from "../utils/redis";
import DynamoDBClient, { Tables } from "../utils/dynamodb";
import { Match } from "../utils/types";

const URLREDIS = process.env.URL_REDIS || "";
const redis = new RedisClient(URLREDIS);
const dynamoDB = new DynamoDBClient();

export const check = async (maches: Match[]) => {
  for (let i = 0; i < maches.length; i++) {
    const { watcher, blockHash, blockNumber, address } = maches[i];
    // watchers [address,signature,id,condition,email]
    const key = `count:${watcher[0]}:${watcher[1]}:${watcher[2]}`;
    // GET THE COUNTER VALUE
    const counter = await redis.get(key);
    console.log(
      "CHECK CONDITIONS : ",
      parseInt(watcher[3]),
      " === ",
      parseInt(counter)
    );
    if (parseInt(watcher[3]) === parseInt(counter)) {
      const now = Date.now();
      try {
        await dynamoDB.add(Tables.Historic, {
          blockHash,
          blockNumber,
          address,
          timestamp: now,
          signature: watcher[1],
          condition: parseInt(watcher[3]),
          userId: watcher[2],
          email: watcher[4],
          id: `${address}:${now}`,
        });

        await redis.remove(key);
      } catch (error) {
        console.error(
          "[CHECKCONDITIONS]",
          "Error on remove the counter ",
          error
        );
      }
    }
  }
  return true;
};

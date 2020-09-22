import RedisClient from "../utils/redis";
import DynamoDBClient, { Tables } from "../utils/dynamodb";
import { Match } from "../utils/types";
const URLREDIS = process.env.URL_REDIS || "";
const redis = new RedisClient(URLREDIS);
const dynamoDB = new DynamoDBClient();

export const check = async (maches: Match[]) => {
  console.log("[CHECKCONDITIONS]", "start lambda");
  for (let i = 0; i < maches.length; i++) {
    const { watcher, blockHash, blockNumber, address } = maches[i];
    // watchers [address,signature,id,condition]
    const key = `count:${watcher[0]}:${watcher[1]}:${watcher[2]}`;
    // GET THE COUNTER VALUE
    console.log("[CHECKCONDITIONS]", "check key ", key);
    const counter = await redis.get(key);
    if (parseInt(watcher[3]) === counter) {
      const now = Date.now();

      await dynamoDB.add(Tables.Historic, {
        blockHash,
        blockNumber,
        address,
        timestamp: now,
        user: watcher[2],
        id: `${address}:${now}`,
      });

      await redis.remove(key);
    } else console.log("CONDITION UNSUCCESS");
  }
  return;
};

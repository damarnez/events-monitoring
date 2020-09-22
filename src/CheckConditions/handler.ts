import RedisClient from "../utils/redis";
import DynamoDBClient from "../utils/dynamodb";
import { Block, Match } from "../types";
const URLREDIS = process.env.REDIS_URL || "";
const redis = new RedisClient(URLREDIS);
const dynamoDB = new DynamoDBClient();

export const check = async (maches: Match[]) => {
  for (let i = 0; i < maches.length; i++) {
    const { watcher, blockHash, blockNumber, address } = maches[i];
    // watchers [address,signature,id,condition]
    const key = `count:${watcher[0]}:${watcher[1]}:${watcher[2]}`;
    // GET THE COUNTER VALUE
    const counter = await redis.get(key);
    if (parseInt(watcher[3]) === counter) {
      dynamoDB.add(watcher[2], {
        blockHash,
        blockNumber,
        address,
        timestamp: Date.now,
      });
      await redis.remove(key);
    }
  }
};

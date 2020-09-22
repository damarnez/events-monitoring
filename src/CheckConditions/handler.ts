import RedisClient from "../utils/redis";

const URLREDIS = process.env.REDIS_URL || "";
const redis = new RedisClient(URLREDIS);
export const check = async (watchers: string[]) => {
  // GET COUNTER RESULT
  // MATCH WITH THE CONDITION
  //// IF OK THEN UPDATE DYNAMODB
  //// REMOVE THE COUNTER
  // IF NOT DO NOTHING
};

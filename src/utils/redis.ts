import redis from "redis";
import bluebird from "bluebird";
bluebird.promisifyAll(redis.RedisClient.prototype);

class Redis {
  private connection: any;
  constructor(URL: string) {
    //this.connection = redis.createClient(URL);
  }
  public incr(key: string) {
    console.log("increment by one ", key);
  }
  public set(key: string, value: string) {
    console.log("set data", key, value);
  }

  public getAll(key: string) {
    console.log("get data");
    return [];
  }
}

export default Redis;

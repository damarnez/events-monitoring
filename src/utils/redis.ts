import Redis from "ioredis";
const TAG = "[REDIS]";

// Timer to waiting the connection ready
const Timer: any = () =>
  new Promise((resolve, reject) => {
    let wait = setTimeout(() => {
      clearTimeout(wait);
      resolve();
    }, 200);
  });

class RedisClient {
  private connection: any;
  constructor(URL: string) {
    console.log("URL: ", URL);
    this.connection = new Redis("6379", URL, {
      connectTimeout: 28000,
      maxRetriesPerRequest: 4,
      retryStrategy: (times) => Math.min(times * 30, 1000),
      reconnectOnError: (error) => {
        const targetErrors = [/READONLY/, /ETIMEDOUT/];
        targetErrors.forEach((targetError) => {
          if (targetError.test(error.message)) {
            return true;
          }
        });
      },
    });
  }
  private async checkConnection() {
    console.log("########## STATUS:", this.connection.status);
    if (this.connection.status === "connecting") {
      // Wait until the redis are connected
      await Timer();
      return await this.checkConnection();
    }
    console.log("########## RESULT STATUS:", this.connection.status);
    return true;
  }
  public async incr(key: string) {
    await this.checkConnection();
    const val = await this.get(key);
    if (val) {
      return await this.connection.incr(key);
    } else {
      return await this.add(key, "1");
    }
  }
  public async add(key: string, value: string, member?: string) {
    await this.checkConnection();
    await this.connection.set(key, value);
    if (member) await this.connection.sadd(member, key);
  }
  public async get(key: string) {
    await this.checkConnection();
    const value: string = await this.connection.get(key.trim());
    return JSON.parse(value);
  }
  public async remove(key: string, member?: string) {
    await this.checkConnection();
    await this.connection.del(key);
    if (member) await this.connection.srem(member, key);
    return true;
  }
  public async getIndexed(key: string) {
    await this.checkConnection();
    const results: any = [];
    const members = await this.connection.smembers(key);
    for (let i = 0; i < members.length; i++) {
      const value: string = await this.connection.get(members[i].trim());
      if (value && value.length > 0) results.push(JSON.parse(value));
    }
    return results;
  }
  public disconnect() {
    this.connection.disconnect();
  }
}

export default RedisClient;

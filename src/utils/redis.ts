import Redis from "ioredis";
const TAG = "[REDIS]";
class RedisClient {
  private connection: any;
  constructor(URL: string) {
    this.connection = new Redis(URL);
  }
  public async incr(key: string) {
    return await this.connection.incr(key);
  }
  public async add(key: string, value: string, member?: string) {
    await this.connection.set(key, value);
    if (member) await this.connection.sadd(member, key);
  }
  public async get(key: string) {
    const value: string = await this.connection.get(key.trim());
    return JSON.parse(value);
  }
  public async remove(key: string) {
    return await this.connection.del(key);
  }
  public async getIndexed(key: string) {
    const results: any = [];
    const members = await this.connection.smembers(key);
    for (let i = 0; i < members.length; i++) {
      const value: string = await this.connection.get(members[i].trim());
      if (value && value.length > 0) results.push(JSON.parse(value));
    }
    return results;
  }
}

export default RedisClient;

import FilterStreams, { EventNames } from "../utils/filterStreams";
import { Tables } from "../utils/dynamodb";
import { EventConfig } from "../utils/types";
import RedisClient from "../utils/redis";

const URL = process.env.URL_REDIS || "";

const config: EventConfig = {
  [Tables.Watcher]: [EventNames.MODIFY],
};
const filterData = new FilterStreams(config);

const redis = new RedisClient(URL);

export const update = async (stream: any) => {
  try {
    const data = filterData.parse(stream);

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (
        item.eventName === EventNames.MODIFY &&
        item.Table === Tables.Watcher &&
        item.dynamodb.NewImage.validated.BOOL !==
          item.dynamodb.OldImage.validated.BOOL &&
        item.dynamodb.NewImage.validated.BOOL === true
      ) {
        const { address, event, id, email } = item.dynamodb.NewImage;
        console.log("#ADD ", id.S);
        await redis.add(
          id.S,
          JSON.stringify([
            address.S.toLowerCase(),
            event.M.signature.S.toLowerCase(),
            id.S,
            event.M.counter.N,
            email.S,
          ]),
          "watchers"
        );
      } else if (
        item.eventName === EventNames.MODIFY &&
        item.Table === Tables.Watcher &&
        item.dynamodb.NewImage.validated.BOOL !==
          item.dynamodb.OldImage.validated.BOOL &&
        item.dynamodb.NewImage.validated.BOOL === false
      ) {
        const { id } = item.dynamodb.NewImage;
        console.log("#REMOVE ", id.S);
        await redis.remove(id.S, "watchers");
      }
    }
  } catch (error) {
    console.log("[SENDEMAILBYTOPIC] Error: ", error);
    return true;
  }
  return true;
};

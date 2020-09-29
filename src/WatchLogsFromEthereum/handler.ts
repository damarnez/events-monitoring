import { Block } from "../utils/types";
import Lambda from "../utils/lambda";
import LogsWatcher from "./logswatcher";
import RedisClient from "../utils/redis";

const DIFF = 15;
const CHUNK_SIZE = 300;
const LOOP_TIME = 5000;
const EVENT_NAME = "events-monitoring-dev-filterevents";
const URLCLIENT_01 = process.env.URL_INFURA_01 || "";
const URLCLIENT_02 = process.env.URL_INFURA_02 || "";

const asyncTimeout = (time) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });

const URL = process.env.URL_REDIS || "";
const redis = new RedisClient(URL);

export const watch = async (stream: any, context: any) => {
  try {
    const watcher = new LogsWatcher([URLCLIENT_01, URLCLIENT_02], DIFF);
    let stopped = false;

    // INFINITE LOOP
    while (!stopped) {
      // Get latest block scanned
      const storedBlock = await redis.get("block");
      const intBlock = parseInt(storedBlock || 0);
      // Get Logs from ethereum
      const {
        block,
        logs,
      }: { logs: Block[]; block: number } = await watcher.pollingLogs(intBlock);

      // If we have results then we invoke next lambda
      if (logs && logs.length > 0) {
        console.log(
          "[WatchLogsFromEthereum]",
          " found ",
          logs.length,
          " in block ",
          block
        );
        // Check if the chunk is big
        if (logs.length > CHUNK_SIZE) {
          const chunks = createChunks(logs, CHUNK_SIZE);
          for (let i = 0; i < chunks.length; i++) {
            const lambda = new Lambda();
            await lambda.invokeEvent(EVENT_NAME, chunks[i]);
          }
        } else {
          const lambda = new Lambda();
          await lambda.invokeEvent(EVENT_NAME, logs);
        }
      }
      // If the calculation of the block are different to -1 then we update to the next block
      if (block != -1) {
        const newBlockNumber = block + 1;
        redis.add("block", newBlockNumber.toString());
      }
      // When the lambda are close to finish we stop the request.
      if (context.getRemainingTimeInMillis() - (LOOP_TIME + 5000) <= 0) {
        stopped = true;
      }

      await asyncTimeout(LOOP_TIME);
    }

    return true;
  } catch (error) {
    console.error("ERROR: ", error);
  } finally {
    return true;
  }
};

const createChunks = (array: any[], n: number) => {
  // Chunking array
  const numberChunks = Math.ceil(array.length / n);
  return [...Array(numberChunks).keys()].map((x, i) =>
    array.slice(i * n, i * n + n)
  );
};

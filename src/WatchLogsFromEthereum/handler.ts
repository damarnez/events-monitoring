import { Block } from "../utils/types";
import Lambda from "../utils/lambda";
import LogsWatcher from "./logswatcher";
import RedisClient from "../utils/redis";

const DIFF = 15;
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
  // context.callbackWaitsForEmptyEventLoop = false;
  try {
    console.log("[WATHCLOGSFROMETHEREUM]", "- START WATCHER -");

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
      console.log(
        "[WATHCLOGSFROMETHEREUM]",
        "block :",
        block,
        " logs : ",
        logs.length
      );
      // If we have results then we invoke next lambda
      if (logs && logs.length > 0) {
        const lambda = new Lambda();
        console.log(
          "INVOKE THE NEW LAMBDA send blocks ",
          parseInt(logs[0].blockNumber)
        );
        await lambda.invokeEvent(EVENT_NAME, logs);
      }
      // If the calculation of the block are different to -1 then we update to the next block
      if (block != -1) {
        const newBlockNumber = block + 1;
        console.log("UPDATE BLOCK NUMBER ", newBlockNumber);
        redis.add("block", (block + 1).toString());
      }
      // When the lambda are close to finish we stop the request.
      if (context.getRemainingTimeInMillis() - (LOOP_TIME + 5000) <= 0) {
        console.log(
          "#################### STOP LAMBDA",
          context.getRemainingTimeInMillis(),
          " - ",
          context.getRemainingTimeInMillis() - (LOOP_TIME + 5000)
        );
        stopped = true;
      }
      console.log(">>> REMAINING TIME : ", context.getRemainingTimeInMillis());
      await asyncTimeout(LOOP_TIME);
    }

    return true;
  } catch (error) {
    console.log(">> ERROR: ", error);
  } finally {
    return true;
  }
};

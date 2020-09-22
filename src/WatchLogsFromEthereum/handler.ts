import { Lambda } from "aws-sdk";
import { Block } from "../types";
import LogsWatcher from "./LogsWatcher";

const EVENT_NAME = "events-monitoring-dev-filterevents";
const URLCLIENT = process.env.URL_INFURA || "";

export const watch = async () => {
  console.log("[WATCHLOGSFROMETHEREUM]", "DEV: ", process.env.DEV);
  const watcher = new LogsWatcher(URLCLIENT);
  const lambda = new Lambda({
    apiVersion: "2031",
    endpoint: process.env.DEV
      ? "http://localhost:3002"
      : "https://lambda.us-east-1.amazonaws.com",
  });

  watcher.pollingLogs(15, async (logs: Block[]) => {
    if (logs && logs.length > 0) {
      await lambda
        .invoke({
          InvocationType: "Event",
          FunctionName: EVENT_NAME,
          LogType: "None",
          Payload: JSON.stringify(logs),
        })
        .promise();
    }
  });
};

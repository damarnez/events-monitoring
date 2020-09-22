import { Lambda } from "aws-sdk";
import { Block } from "../types";
import LogsWatcher from "./LogsWatcher";

const EVENT_NAME = "events-monitoring-dev-filterevents";
const URLCLIENT = process.env.URL_INFURA || "";

export const watch = async () => {
  const watcher = new LogsWatcher(URLCLIENT);
  const lambda = new Lambda();

  watcher.pollingLogs(15, (logs: Block[]) => {
    if (logs && logs.length > 0) {
      lambda
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

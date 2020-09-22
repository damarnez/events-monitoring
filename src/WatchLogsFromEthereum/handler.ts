import { Block } from "../utils/types";
import Lambda from "../utils/lambda";
import LogsWatcher from "./logswatcher";

const EVENT_NAME = "events-monitoring-dev-filterevents";
const URLCLIENT = process.env.URL_INFURA || "";

export const watch = async () => {
  console.log("[WATCHLOGSFROMETHEREUM]", "DEV: ", process.env.DEV);

  const watcher = new LogsWatcher(URLCLIENT);
  const lambda = new Lambda();
  watcher.pollingLogs(15, async (logs: Block[]) => {
    if (logs && logs.length > 0) {
      await lambda.invokeEvent(EVENT_NAME, logs);
    }
  });
};

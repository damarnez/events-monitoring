import { Block } from "../utils/types";
import Lambda from "../utils/lambda";
import LogsWatcher from "./logswatcher";

const EVENT_NAME = "events-monitoring-dev-filterevents";
const URLCLIENT = process.env.URL_INFURA || "";
// We control the execution
let watcher;

export const watch = () => {
  console.log(
    "[WATHCLOGSFROMETHEREUM]",
    "This lambda are already running? ",
    !!watcher
  );
  if (!watcher) {
    console.log("START WATCHER");
    watcher = new LogsWatcher(URLCLIENT);
    watcher.pollingLogs(15, async (logs: Block[]) => {
      console.log("[WATHCLOGSFROMETHEREUM]", " logs : ", logs.length);
      if (logs && logs.length > 0) {
        const lambda = new Lambda();
        console.log("INVOKE THE NEW LAMBDA");
        await lambda.invokeEvent(EVENT_NAME, logs);
      }
    });
  }
};

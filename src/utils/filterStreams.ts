import { EventConfig } from "./types";

export enum EventNames {
  INSERT = "INSERT",
  MODIFY = "MODIFY",
}

export default class FilterStreams {
  private filterEvents: EventConfig;
  constructor(filterEvents: EventConfig) {
    this.filterEvents = filterEvents;
  }
  private getTable({ eventSourceARN }: { eventSourceARN: string }) {
    const [, table] = eventSourceARN.split("/");
    return table;
  }
  public parse(events: any) {
    return events["Records"]
      ?.filter((ev) => {
        // console.log("EVENT:", ev);
        const tableEvent = this.getTable(ev);
        return (
          this.filterEvents[tableEvent] &&
          this.filterEvents[tableEvent].includes(ev.eventName)
        );
      })
      .map((ev) => {
        ev.Table = this.getTable(ev);
        return ev;
      });
  }
}

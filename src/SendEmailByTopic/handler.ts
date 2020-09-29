import FilterStreams, { EventNames } from "../utils/filterStreams";
import { Tables } from "../utils/dynamodb";
import { EventConfig } from "../utils/types";
import { sendEmail, Templates } from "../utils/sendEmail";

const config: EventConfig = {
  [Tables.Watcher]: [EventNames.INSERT, EventNames.MODIFY],
  [Tables.Historic]: [EventNames.INSERT],
};
const filterData = new FilterStreams(config);

export const send = async (stream: any) => {
  try {
    const data = filterData.parse(stream);
    for (let i = 0; i < data.length; i++) {
      const event = data[i];

      if (
        event.eventName === EventNames.INSERT &&
        event.Table === Tables.Watcher
      ) {
        await sendEmail(Templates.REGISTER, event.dynamodb.NewImage);
      } else if (
        event.eventName === EventNames.MODIFY &&
        event.Table === Tables.Watcher &&
        event.dynamodb.NewImage.validated.BOOL !==
          event.dynamodb.OldImage.validated.BOOL &&
        event.dynamodb.NewImage.validated.BOOL === true
      ) {
        await sendEmail(Templates.VALIDATED, event.dynamodb.NewImage);
      } else if (
        event.eventName === EventNames.MODIFY &&
        event.Table === Tables.Watcher &&
        event.dynamodb.NewImage.validated.BOOL !==
          event.dynamodb.OldImage.validated.BOOL &&
        event.dynamodb.NewImage.validated.BOOL === false
      ) {
        await sendEmail(Templates.UNSUBSCRIBE, event.dynamodb.NewImage);
      } else if (
        event.eventName === EventNames.INSERT &&
        event.Table === Tables.Historic
      ) {
        await sendEmail(Templates.CONDITION, event.dynamodb.NewImage);
      } else {
        throw new Error("Condition not implemented");
      }
    }
  } catch (error) {
    console.error("[SENDEMAILBYTOPIC]", "ERROR: ", error);
    throw error;
  }
};

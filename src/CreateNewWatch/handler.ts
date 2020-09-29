import DynamoDBClient, { Tables } from "../utils/dynamodb";
import { isAddress } from "web3-utils";
import isEmail from "validator/lib/isEmail";
import isEmpty from "validator/lib/isEmpty";
import { Event } from "../utils/types";
import message from "../utils/responses";
import { v4 as uuidv4 } from "uuid";
const dynamodb = new DynamoDBClient();

/*
Example post body
{
  email:"xxxx@xxxx.com"
  address:"0x0000000000"
  events: [
    { name: 'UpdateBlabla', signature :'0x00000000' , counter: 2 },
    { name: 'UpdateBlabla', signature :'0x00000000' , counter: 2 }
  ]
}
*/

export const create = async (event: any) => {
  try {
    const requestBody = JSON.parse(event.body);
    const error = validation(requestBody);
    if (error) return error;

    const { email, events, address } = requestBody;
    // Filter only the values that we need
    const filteredEvents: Event[] = events.map(
      ({ name, signature, counter }) => {
        return {
          name,
          signature,
          counter,
        };
      }
    );

    const timestamp = Date.now();

    for (let i = 0; i < filteredEvents.length; i++) {
      // For each event we create a new watcher
      await dynamodb.add(Tables.Watcher, {
        id: uuidv4(),
        email,
        token: uuidv4(),
        address,
        event: filteredEvents[i],
        validated: false,
        timestamp,
      });
    }

    return message(200, "success");
  } catch (error) {
    console.log("[CreateNewWatch]", error);
    return message(500, "Something went wrong.");
  }
};

function validation({ email, address, events }) {
  if (!isEmail(email)) return message(401, "Wrong email format");
  if (!isAddress(address)) return message(401, "Wrong address format");
  if (events && events.length > 0) {
    const hasError = events.some((event) => {
      if (isEmpty(event.name)) return true;
      if (isEmpty(event.signature)) return true;
      if (
        !Number.isInteger(event.number) &&
        event.number < 0 &&
        event.number > 100
      )
        return true;
    });
    if (hasError) return message(401, "wrong event object");

    // SUCCESS
    return false;
  } else {
    return message(401, "Events array not found");
  }
}

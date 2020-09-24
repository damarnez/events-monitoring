import DynamoDBClient, { Tables } from "../utils/dynamodb";
import { Watcher } from "../utils/types";
import message from "../utils/responses";
import { v4 as uuidv4 } from "uuid";
const dynamodb = new DynamoDBClient();

export const unsubscribe = async (event: any) => {
  const { email, token } = event.pathParameters;
  try {
    const watchers: Watcher[] | undefined = await dynamodb.search(
      Tables.Watcher,
      "#e = :email",
      {
        "#e": "email",
      },
      {
        ":email": email,
      }
    );
    const watch: Watcher | undefined = watchers.find(
      (wat) => wat.token === token
    );
    if (!watch) return message(404, "Invalid token");
    if (!watch.validated) return message(201, "Already unsubscribed");
    //Update the token and the validation field
    await dynamodb.update(
      Tables.Watcher,
      {
        email,
        id: watch.id,
      },
      "set #val = :v, #tok=:t",
      {
        "#tok": "token",
        "#val": "validated",
      },
      {
        ":v": false,
        ":t": uuidv4(),
      }
    );

    return message(201, "Success unsubscribe");
  } catch (error) {
    console.error("[UnsubscribeEmailByToken]", error);
    return message(500, "Something went wrong");
  }
};

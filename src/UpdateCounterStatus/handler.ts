import { Handler } from "aws-lambda";

export const update: Handler = (event: any) => {
  console.log(JSON.stringify(event, null, 2));
  // Check the modification
  // if MODIFY
  //// if is old_validated = false and new_validated = true
  ////// Load the object from dynamoDB
  ////// Set the new watcher in redis
  //// else if old_validated = true and new_validated = false
  ////// Load the object from dynamoDB
  ////// remove the watcher from redis
};

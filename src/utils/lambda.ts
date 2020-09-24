import { Lambda } from "aws-sdk";

class LambdaClient {
  private connection: any;
  constructor() {
    this.connection = process.env.IS_OFFLINE
      ? new Lambda({
          apiVersion: "2031",
          endpoint: "http://localhost:3002",
        })
      : new Lambda();
  }
  public async invokeEvent(NAME, data) {
    return this.connection
      .invoke({
        InvocationType: "Event",
        FunctionName: NAME,
        LogType: "None",
        Payload: JSON.stringify(data),
      })
      .promise();
  }
}

export default LambdaClient;

import { DynamoDB } from "aws-sdk";

class DynamoDBClient {
  private connection: any;
  constructor() {
    this.connection = process.env.IS_OFFLINE
      ? new DynamoDB.DocumentClient({
          region: "localhost",
          endpoint: "http://localhost:8000",
        })
      : new DynamoDB.DocumentClient();
  }
  public add(key, data) {
    console.log(key, data);
  }
}

export default DynamoDBClient;

import { DynamoDB } from "aws-sdk";

export enum Tables {
  Historic = "Historic",
  Watchers = "Watchers",
}
class DynamoDBClient {
  private connection: any;
  constructor() {
    this.connection = process.env.IS_OFFLINE
      ? new DynamoDB.DocumentClient({
          region: "localhost",
          endpoint: process.env.URL_DYNAMODB,
        })
      : new DynamoDB.DocumentClient();
  }
  public async add(table, data) {
    var params = {
      TableName: table,
      Item: data,
    };
    return await this.connection.put(params).promise();
  }
}

export default DynamoDBClient;

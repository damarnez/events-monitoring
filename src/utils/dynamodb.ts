import { DynamoDB } from "aws-sdk";
import { StoredData, Watcher, Historic } from "../utils/types";
export enum Tables {
  Historic = "Historic",
  Watcher = "Watcher",
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

  public async add(table: Tables, data: Watcher | Historic) {
    var params = {
      TableName: table,
      Item: data,
    };
    return await this.connection.put(params).promise();
  }

  public async get<A extends StoredData>(
    table: Tables,
    key: object
  ): Promise<A> {
    var params = {
      TableName: table,
      Key: key,
    };
    return await this.connection.get(params).promise();
  }

  public async update(
    table: string,
    key: object,
    expression: string,
    attrVal: object
  ) {
    var params = {
      TableName: table,
      Key: key,
      UpdateExpression: expression,
      ExpressionAttributeValues: attrVal,
      ReturnValues: "UPDATED_NEW",
    };

    return await this.connection.update(params).promise();
  }

  public async search<A extends StoredData[]>(
    table: string,
    expression: string,
    attrName: object,
    attrVal: object
  ): Promise<A> {
    var params = {
      TableName: table,
      KeyConditionExpression: expression,
      ExpressionAttributeNames: attrName,
      ExpressionAttributeValues: attrVal,
    };
    return await this.connection.query(params).promise();
  }
}

export default DynamoDBClient;

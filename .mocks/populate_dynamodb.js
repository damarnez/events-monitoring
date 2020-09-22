const AWS = require('aws-sdk');

AWS.config.update({
  region: "us-west-2",
  // The endpoint should point to the local or remote computer where DynamoDB (downloadable) is running.
  endpoint: process.env.URL_DYNAMODB,
  /*
    accessKeyId and secretAccessKey defaults can be used while using the downloadable version of DynamoDB. 
    For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
  */
  accessKeyId: "fakeMyKeyId",
  secretAccessKey: "fakeSecretAccessKey"
});



var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

var watchersTable = {
  TableName: "Watchers",
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" },
    { AttributeName: "email", KeyType: "RANGE" }

  ],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "email", AttributeType: "S" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
};

var historicTable = {
  TableName: "Historic",
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" },
  ],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
};




function createTable(params) {

  dynamodb.createTable(params, function (err, data) {
    if (err) console.error(err);
    else console.log(`Created Table : ${params.TableName}`)
  });
}


createTable(watchersTable);
createTable(historicTable);


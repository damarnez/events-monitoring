const AWS = require('aws-sdk');

AWS.config.update({
  region: "localhost",
  // The endpoint should point to the local or remote computer where DynamoDB (downloadable) is running.
  endpoint: process.env.URL_DYNAMODB,

});



var global = new AWS.DynamoDB();
var dynamodb = new AWS.DynamoDB.DocumentClient();

var watchersTable = {
  TableName: "Watcher",
  KeySchema: [
    { AttributeName: "email", KeyType: "HASH" },
    { AttributeName: "id", KeyType: "RANGE" }
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

  global.createTable(params, function (err, data) {
    if (err) console.error(err);
    else console.log(`Created Table : ${params.TableName}`)
  });
}
async function getListTables() {
  const a = await global.listTables((error, data) => {
    console.log('ERRO:', error);
    console.log('DATA:', data);
  });
  // console.log(a);
}
// async function add(table, data) {
//   var params = {
//     TableName: table,
//     Item: data,
//   };
//   console.log('PUT')
//   await dynamodb.put(params).promise().catch(console.error);
// }


// async function get(table, key) {
//   var params = {
//     TableName: table,
//     Key: key,
//   };
//   return await dynamodb.get(params).promise();
// }

// async function search(table, expression, attrName, attrVal) {
//   var params = {
//     TableName: table,
//     KeyConditionExpression: expression,
//     ExpressionAttributeNames: attrName,
//     ExpressionAttributeValues: attrVal,
//     ScanIndexForward: false
//   };
//   console.log(params)
//   return await dynamodb.query(params).promise();
// }
// const check = async () => {
//   const email = "dani@dani.com";
//   await add("Watchers", {
//     id: "Wxxxxxxxx1",
//     email,
//     token: 1234
//   });


//   await add("Watchers", {
//     id: "Wxxxxxxxx2",
//     email,
//     token: 5678
//   });

//   await add("Watchers", {
//     id: "Wxxxxxxxx3",
//     email,
//     token: 99999
//   });
//   const resp = await search("Watchers", "#e = :email",
//     {
//       "#e": "email",
//     },
//     {
//       ":email": "Wxxxxxxxx2"
//     },
//   );

//   console.log("SEARCH: ", resp);

//   const getfn = await get("Watchers", { id: "Wxxxxxxxx3", email });
//   console.log("GET :", getfn)

// }
console.log('CREATE TABLES');
getListTables();
createTable(watchersTable);
createTable(historicTable);

// check();
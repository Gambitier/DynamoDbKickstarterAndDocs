# Installation

step-1:

      pull image from docker hub
      https://hub.docker.com/r/amazon/dynamodb-local

step-2:

      right click on `docker-compose.yml` and select compose up

ref:

- https://stackoverflow.com/questions/63835658/can-not-find-table-using-nosql-workbench-for-dynamodb-when-connecting-to-dynamod

---

# Documentation

## Programatic Access of DynamoDB

ref:

- [Getting an AWS Access Key](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SettingUp.DynamoWebService.html)

## Configuring the SDK for JavaScript

- [Configuring maxSockets & Reusing Connections in Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/configuring-the-jssdk.html)

## Tutorials

- [Programming with DynamoDB and the AWS SDKs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.html)
- [Working with Tables, Items, Queries, Scans, and Indexes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithDynamo.html)
- [Amazon DynamoDB Examples](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-examples.html)
- [Getting Started with Node.js and DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.html)
- [AWS DynamoDB Attribute Data Types](https://usefulangle.com/post/332/dynamodb-attribute-types)

## Dynamo DB, AWS::DynamoDB::Table, setting Provisions

Provisions can be set as

1. pay per request or on-demand throughput

```
BillingMode: 'PAY_PER_REQUEST',
```

2. Otherwise by default it's set to PROVISIONED

```
ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
}
```

ref:

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html#cfn-dynamodb-table-billingmode

---

# Notes

## Working with Items and Attributes

You can work with any attribute, even if it is deeply nested within multiple lists and maps.

DynamoDB provides four operations for basic create, read, update, and delete (CRUD) functionality:

1. PutItem — Create an item. If an item with the same key already exists in the table, it is replaced with the new item.
2. GetItem — Read an item. Can retrieve up to 16 MB of data
3. UpdateItem — If an item with the specified key does not exist, UpdateItem creates a new item. Otherwise Update an existing item.
4. DeleteItem — Delete an item.

**NOTE:**

Each of these operations requires that you specify the primary key of the item that you want to work with. For example, to read an item using GetItem, you must specify the partition key and sort key (if applicable) for that item

In addition to the four basic CRUD operations, DynamoDB also provides the following:

1. BatchGetItem — Read up to 100 items from one or more tables. BatchGetItem operation can retrieve items from multiple tables
2. BatchWriteItem — Create or delete up to 25 items in one or more tables.

The batch operations read and write items in parallel to minimize response latencies.

**Eventually consistent vs strongly consistent**
A GetItem request performs an eventually consistent read by default. You can use the ConsistentRead parameter to request a strongly consistent read instead. (This consumes additional read capacity units, but it returns the most up-to-date version of the item.)

```
aws dynamodb get-item \
    --table-name ProductCatalog \
    --key '{"Id":{"N":"1"}}' \
    --consistent-read \
    --projection-expression "Description, Price, RelatedItems" \
    --return-consumed-capacity TOTAL
```

### Return values on write operations

In some cases, you might want DynamoDB to return certain attribute values as they appeared before or after you modified them. The PutItem, UpdateItem, and DeleteItem operations have a `ReturnValues` parameter that you can use to return the attribute values before or after they are modified.

The default value for ReturnValues is NONE, meaning that DynamoDB does not return any information about attributes that were modified.

The following are the other valid settings for ReturnValues, organized by DynamoDB API operation.

**PutItem**

      ReturnValues: ALL_OLD

            If you overwrite an existing item, ALL_OLD returns the entire item as it appeared before the overwrite.

            If you write a nonexistent item, ALL_OLD has no effect.

**UpdateItem**

      The most common usage for UpdateItem is to update an existing item. However, UpdateItem actually performs an upsert, meaning that it automatically creates the item if it doesn't already exist.

      ReturnValues: ALL_OLD

            If you update an existing item, ALL_OLD returns the entire item as it appeared before the update.

            If you update a nonexistent item (upsert), ALL_OLD has no effect.

      ReturnValues: ALL_NEW

            If you update an existing item, ALL_NEW returns the entire item as it appeared after the update.

            If you update a nonexistent item (upsert), ALL_NEW returns the entire item.

      ReturnValues: UPDATED_OLD

            If you update an existing item, UPDATED_OLD returns only the updated attributes, as they appeared before the update.

            If you update a nonexistent item (upsert), UPDATED_OLD has no effect.

      ReturnValues: UPDATED_NEW

            If you update an existing item, UPDATED_NEW returns only the affected attributes, as they appeared after the update.

            If you update a nonexistent item (upsert), UPDATED_NEW returns only the updated attributes, as they appear after the update.

**DeleteItem**

      ReturnValues: ALL_OLD

            If you delete an existing item, ALL_OLD returns the entire item as it appeared before you deleted it.

            If you delete a nonexistent item, ALL_OLD doesn't return any data.

### Conditional Writes

By default, the DynamoDB write operations (PutItem, UpdateItem, DeleteItem) are unconditional: Each operation overwrites an existing item that has the specified primary key.

DynamoDB optionally supports conditional writes for these operations. A conditional write succeeds only if the item attributes meet one or more expected conditions. Otherwise, it returns an error. Conditional writes are helpful in many situations. For example, you might want a PutItem operation to succeed only if there is not already an item with the same primary key. Or you could prevent an UpdateItem operation from modifying an item if one of its attributes has a certain value.

Conditional writes are helpful in cases where multiple users attempt to modify the same item

for more [ref link](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithItems.html#WorkingWithItems.ConditionalUpdate)

### Item Attributes

- Top-Level Attributes

      An attribute is said to be top level if it is not embedded within another attribute.
      e.g. in the following json top-levels are QuantityOnHand, RelatedItems, Pictures

      ```
            "QuantityOnHand": null,
            "RelatedItems": [
                  341,
                  472,
                  649
            ],
            "Pictures": {
                  "FrontView": "http://example.com/products/123_front.jpg",
                  "RearView": "http://example.com/products/123_rear.jpg",
                  "SideView": "http://example.com/products/123_left_side.jpg"
            },
      ```

- Nested Attributes

      An attribute is said to be nested if it is embedded within another attribute. To access a nested attribute, you use dereference operators:

            [n] — for list elements. The number within the square brackets must be a non-negative integer

            . (dot) — for map elements

      List elements are zero-based, so [0] represents the first element in the list, [1] represents the second, and so on.The element ThisList[5] is itself a nested list. Therefore, ThisList[5][11] refers to the 12th element in that list.

- Document Paths

      In an expression, you use a document path to tell DynamoDB where to find an attribute. For a top-level attribute, the document path is simply the attribute name. For a nested attribute, you construct the document path using dereference operators.

      e.g. Description, RelatedItems[2], ProductReviews.FiveStar[0]

## Reserved Words

Sometimes you might need to write an expression containing an attribute name that conflicts with a DynamoDB reserved word. (For a complete list of reserved words, [see Reserved Words in DynamoDB.](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html))

For example, the following AWS CLI example would fail because COMMENT is a reserved word.

```
aws dynamodb get-item \
    --table-name ProductCatalog \
    --key '{"Id":{"N":"123"}}' \
    --projection-expression "Comment"
```

To work around this, you can replace Comment with an **expression attribute name** [ref here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html), such as #c. The # (pound sign) is required and indicates that this is a placeholder for an attribute name. The AWS CLI example would now look like the following.

```
aws dynamodb get-item \
     --table-name ProductCatalog \
     --key '{"Id":{"N":"123"}}' \
     --projection-expression "#c" \
     --expression-attribute-names '{"#c":"Comment"}'
```

## Insert Items to DynamoDB Tables

Keep in mind that for the insert action the most basic step is to specify the the primary key.

For the table users the primary key is the attribute email. You can add as many attributes as you want however the cumulative size should not surpass 400 KB.

```
var params = {
      TableName:"Users",
      Item:{
            email : { S:"jon@doe.com"},
            fullname: { S:"Jon Doe"}
      }
};

dynamodb.putItem(params,callback);
```

DynamoDB also supports Batch writes. In this case the main benefit lies on less I/O, however nothing changes regarding consumed capacity.

```
var insetBatchLogins = function(callback) {

    var dynamodb = new AWS.DynamoDB();
    var batchRequest = {
            RequestItems: {
                "Logins": [
                        {
                              PutRequest: {
                              Item: {
                                    "email": { S: "jon@doe.com" },
                                    "timestamp": { N: "1467041009976" }
                              }
                        }},
                        {
                              PutRequest: {
                              Item: {
                                    "email": { S: "jon@doe.com" },
                                    "timestamp": { N: "1467041019976" }
                              }
                        }}
                  ]
            }
      };

    dynamodb.batchWriteItem(batchRequest,callback);
};
```

In case of an insert with a global/local secondary index all you have to do is to specify the corresponding attributes for the index. Take into consideration that you can have empty index related attributes or even duplicates.

```
var params = {
        TableName:"Supervisors",
        Item:{
            name: { S:"Random SuperVisor"},
            company: { S:"Random Company"},
            factory: { S:"Jon Doe"}
        }
    };

dynamodb.putItem(params,callback);
```

## Query and Scan Data with AWS SDK for JavaScript in DynamoDB

- [ref here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.04.html)
- [Tutorial](https://egkatzioura.com/2016/07/02/query-dynamodb-items-with-node-js/)

The examples shows how to query a table by its primary key attributes. In DynamoDB, you can optionally create one or more secondary indexes on a table, and query those indexes in the same way that you query a table. Secondary indexes give your applications additional flexibility by allowing queries on non-key attributes.

#### Query

1. Query - All Movies Released in a Year

```
var params = {
    TableName : "Movies",
    KeyConditionExpression: "#yr = :yyyy",
    ExpressionAttributeNames:{
        "#yr": "year"
    },
    ExpressionAttributeValues: {
        ":yyyy": 1985
    }
};

docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log(" -", item.year + ": " + item.title);
        });
    }
});
```

**Note**
`ExpressionAttributeNames` provides name substitution. You use this because year is a reserved word in Amazon DynamoDB. You can't use it directly in any expression, including `KeyConditionExpression`. You use the expression attribute name #yr to address this.

`ExpressionAttributeValues` provides value substitution. You use this because you cannot use literals in any expression, including `KeyConditionExpression`. You use the expression attribute value :yyyy to address this.

2. Query - All Movies Released in a Year with Certain Titles

```
console.log("Querying for movies from 1992 - titles A-L, with genres and lead actor");

var params = {
    TableName : "Movies",
    ProjectionExpression:"#yr, title, info.genres, info.actors[0]",
    KeyConditionExpression: "#yr = :yyyy and title between :letter1 and :letter2",
    ExpressionAttributeNames:{
        "#yr": "year"
    },
    ExpressionAttributeValues: {
        ":yyyy": 1992,
        ":letter1": "A",
        ":letter2": "L"
    }
};
```

#### Scan

The scan method reads every item in the table and returns all the data in the table. You can provide an optional filter_expression, so that only the items matching your criteria are returned. **However, the filter is applied only after the entire table has been scanned.**

```
var params = {
    TableName: "Movies",
    ProjectionExpression: "#yr, title, info.rating",
    FilterExpression: "#yr between :start_yr and :end_yr",
    ExpressionAttributeNames: {
        "#yr": "year",
    },
    ExpressionAttributeValues: {
         ":start_yr": 1950,
         ":end_yr": 1959
    }
};

console.log("Scanning Movies table.");
docClient.scan(params, onScan);

function onScan(err, data) {
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        // print all the movies
        console.log("Scan succeeded.");
        data.Items.forEach(function(movie) {
           console.log(
                movie.year + ": ",
                movie.title, "- rating:", movie.info.rating);
        });

        // continue scanning if we have more movies, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, onScan);
        }
    }
}
```

## More on queries

- [blog post part-1](https://egkatzioura.com/2016/07/02/query-dynamodb-items-with-node-js/)
- [blog post part-2](https://egkatzioura.com/2016/07/20/query-dynamodb-items-with-node-js-part-2/)

The main rule is that every query has to use the hash key.

The simplest form of query is using the hash key only. We will query the Users table on this one. There would be only one result, therefore there is no use on iterating the Items list.

```
var getUser = function(email,callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
            TableName: "Users",
            KeyConditionExpression: "#email = :email",
            ExpressionAttributeNames:{
                "#email": "email"
            },
            ExpressionAttributeValues: {
                ":email":email
            }
        };

    docClient.query(params,callback);
};
```

we can issue more complex queries using conditions.

Keep in mind that DynamoDB Fetches data in pages, therefore you have to issue the same request more than once in case of multiple pages. Therefore you have to use the last evaluated key to your next request. In case of many entries be aware that you should handle the call stack size.

```
var queryLogins = function(email,from,to,callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName:"Logins",
        KeyConditionExpression:"#email = :emailValue and #timestamp BETWEEN :from AND :to",
        ExpressionAttributeNames: {
            "#email":"email",
            "#timestamp":"timestamp"
        },
        ExpressionAttributeValues: {
            ":emailValue":email,
            ":from": from.getTime(),
            ":to":to.getTime()
        }
    };

    var items = []

    var queryExecute = function(callback) {

        docClient.query(params,function(err,result) {

            if(err) {
                callback(err);
            } else {

                console.log(result)

                items = items.concat(result.Items);

                if(result.LastEvaluatedKey) {

                    params.ExclusiveStartKey = result.LastEvaluatedKey;
                    queryExecute(callback);
                } else {
                    callback(err,items);
                }
            }
        });
    }

    queryExecute(callback);
};
```

Querying on indexes. Keep in mind that the results fetched depend on the projection type we specified once creating the Table.
Note how `IndexName` is specified here in this one and not on the previous query. The query is based on table created below in `Improving Data Access with Secondary Indexes` section.

```
var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
        TableName: "Supervisors",
        IndexName: "FactoryIndex",
        KeyConditionExpression:"#company = :companyValue and #factory = :factoryValue",
        ExpressionAttributeNames: {
            "#company":"company",
            "#factory":"factory"
        },
        ExpressionAttributeValues: {
            ":companyValue": company,
            ":factoryValue": factory
        }
    };

docClient.query(params,callback);
```

Projections is a feature that has a select-like functionality.
You choose which attributes from a DynamoDB Item shall be fetched. Keep in mind that using projection will not have any impact on your query billing.

```
var getRegisterDate = function(email,callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
            TableName: "Users",
            KeyConditionExpression: "#email = :email",
            ExpressionAttributeNames:{
                "#email": "email"
            },
            ExpressionAttributeValues: {
                ":email":email
            },
            ProjectionExpression: 'registerDate'
        };

    docClient.query(params,callback);
}
```

Apart from selecting the attributes we can also specify the order according to our range key. We shall query the logins Table in a Descending order using `scanIndexForward`.

```
var fetchLoginsDesc = function(email,callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName:"Logins",
        KeyConditionExpression:"#email = :emailValue",
        ExpressionAttributeNames: {
            "#email":"email"
        },
        ExpressionAttributeValues: {
            ":emailValue":email
        },
        ScanIndexForward: false
    };

    docClient.query(params,callback);
}
```

A common functionality of databases is counting the items persisted in a collection. In our case we want to count the login occurrences of a specific user. However pay extra attention since the count functionality does nothing more than counting the total items fetched, therefore it will cost you as if you fetched the items.

```
var countLogins = function(email,callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName:"Logins",
        KeyConditionExpression:"#email = :emailValue",
        ExpressionAttributeNames: {
            "#email":"email"
        },
        ExpressionAttributeValues: {
            ":emailValue":email
        },
        Select:'COUNT'
    };

    docClient.query(params,callback);

}
```

Another feature of DynamoDB is getting items in batches even if they belong on different tables. This is really helpful in cases where data that belong on a specific context are spread through different tables. Every get item is handled and charged as a DynamoDB read action. In case of batch get item all table keys should be specified since every query’s purpose on BatchGetItem is to fetch a single Item.
It is important to know that you can fetch up to 1 MB of data and up to 100 items per BatchGetTime request.

```
var getMultipleInformation = function(email,name,callback) {

    var params = {
            "RequestItems" : {
                "Users": {
                  "Keys" : [
                    {"email" : { "S" : email }}
                  ]
                },
                "Supervisors": {
                   "Keys" : [
                    {"name" : { "S" : name }}
                  ]
                }
              }
            };

    dynamodb.batchGetItem(params,callback);
};
```

## Improving Data Access with Secondary Indexes

Next table is Supervisors. The hash key of Supervisor would be his name. A supervisor will work for a company. The company will be our global secondary index. Since the companies own more than one factories the field factory would be the range key.

```
var createSupervisors = function(callback) {

    var dynamodb = new AWS.DynamoDB();

    var params = {
        TableName : "Supervisors",
        KeySchema: [
            { AttributeName: "name", KeyType: "HASH"}
        ],
        AttributeDefinitions: [
            { AttributeName: "name", AttributeType: "S" },
            { AttributeName: "company", AttributeType: "S" },
            { AttributeName: "factory", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
           },
        GlobalSecondaryIndexes: [{
                IndexName: "FactoryIndex",
                KeySchema: [
                    {
                        AttributeName: "company",
                        KeyType: "HASH"
                    },
                    {
                        AttributeName: "factory",
                        KeyType: "RANGE"
                    }
                ],
                Projection: {
                    ProjectionType: "ALL"
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1
                }
            }]
    };

    dynamodb.createTable(params, callback);
};
```

ref:

- https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html
- https://egkatzioura.com/2016/06/23/create-dynamodb-tables-with-node-js/

# Best Practices

## Differences Between Relational Data Design and NoSQL

**Relational database systems (RDBMS) and NoSQL databases have different strengths and weaknesses:**

- In RDBMS, data can be queried flexibly, but queries are relatively expensive and don't scale well in high-traffic situations (see First Steps for Modeling Relational Data in DynamoDB).

- In a NoSQL database such as DynamoDB, data can be queried efficiently in a limited number of ways, outside of which queries can be expensive and slow.

**These differences make database design different between the two systems:**

- In RDBMS, you design for flexibility without worrying about implementation details or performance. Query optimization generally doesn't affect schema design, but normalization is important.

- In DynamoDB, you design your schema specifically to make the most common and important queries as fast and as inexpensive as possible. Your data structures are tailored to the specific requirements of your business use cases.

**Two Key Concepts for NoSQL Design**

- [ref](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

NoSQL design requires a different mindset than RDBMS design.

For an RDBMS,

      you can go ahead and create a normalized data model without thinking about access patterns. You can then extend it later when new questions and query requirements arise. You can organize each type of data into its own table.

How NoSQL design is different

      By contrast, you shouldn't start designing your schema for DynamoDB until you know the questions it will need to answer. Understanding the business problems and the application use cases up front is essential.

      You should maintain as few tables as possible in a DynamoDB application.

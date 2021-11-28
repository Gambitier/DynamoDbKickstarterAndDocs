const AWS = require('aws-sdk');
const http = require('http');

// http or https
// By default, the default Node.js HTTP/HTTPS agent creates a new TCP connection for every new request.
// To avoid the cost of establishing a new connection, you can reuse an existing connection.
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/node-reusing-connections.html
const httpAgent = new http.Agent({
	keepAlive: true,
});

// TDOO: setup either http or https agent based on environment

AWS.config.update({
	region: 'ap-southeast-2',
	endpoint: 'http://localhost:8000',
	accessKeyId: '7vsr4a',
	accessSecretKey: 'jqwcy',
	httpOptions: {
		agent: httpAgent,
	},
});

const dynamodb = new AWS.DynamoDB();

const CreateDynamoDBTable = async (tableDefinition) => {
	try {
		const data = await dynamodb.createTable(tableDefinition).promise();
		console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
	} catch (err) {
		console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
	}
};

const AddNewRecord = async ({ tableName, entityToAdd }) => {
	try {
		const params = {
			TableName: tableName,
			Item: entityToAdd,
		};
		console.log('Adding a new item...', params);
		const data = await dynamodb.put(params).promise();
		console.log('Added item:', JSON.stringify(data, null, 2));
		return data;
	} catch (err) {
		console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));
		return null;
	}
};

const ListDynamoDBTables = async () => {
	let list = [];
	try {
		const response = await dynamodb.listTables({}).promise();
		list = response.TableNames;
		console.log(list.join('\n'));
	} catch (err) {
		console.error(err);
	}
	return list;
};

module.exports = {
	ListDynamoDBTables,
	AddNewRecord,
	CreateDynamoDBTable,
};

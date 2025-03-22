import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
    region: "us-east-1"
});

export const dynamodb = DynamoDBDocumentClient.from(client);

export const TableName = process.env.TABLE_NAME || ""; 
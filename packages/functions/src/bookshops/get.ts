import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TableName } from "../lib/dynamodb";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        const id = event.pathParameters?.id;

        if (!id) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ error: "Missing car show ID" }),
            };
        }

        const result = await dynamodb.send(
            new GetCommand({
                TableName,
                Key: { id },
            })
        );

        if (!result.Item) {
            return {
                statusCode: 404,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ error: "Car show not found" }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(result.Item),
        };
    } catch (error) {
        console.error("Error fetching car show:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
}; 
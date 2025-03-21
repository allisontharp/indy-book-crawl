import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TableName } from "../lib/dynamodb";
import { Logger } from '@aws-lambda-powertools/logger';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const logger = new Logger({ serviceName: 'listCarShow' });
    logger.info(`Listing Car Shows: ${JSON.stringify(event)}`);
    try {
        const approved = event.queryStringParameters?.approved === "true";
        const includeDeleted = event.queryStringParameters?.includeDeleted === "true";

        const result = await dynamodb.send(
            new QueryCommand({
                TableName,
                IndexName: "byDate",
                KeyConditionExpression: "approved = :approved",
                FilterExpression: includeDeleted ? undefined : "attribute_not_exists(deleted) OR deleted = :notDeleted",
                ExpressionAttributeValues: {
                    ":approved": approved.toString(),
                    ...(includeDeleted ? {} : { ":notDeleted": "false" }),
                },
                ScanIndexForward: true, // true for ascending order by date
            })
        );

        const carShows = result.Items || [];

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(carShows),
        };
    } catch (error) {
        logger.error("Error fetching car shows:", { error: error instanceof Error ? error.message : String(error) });
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
}; 
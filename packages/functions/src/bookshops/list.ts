import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TableName } from "../lib/dynamodb";
import { Logger } from '@aws-lambda-powertools/logger';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const logger = new Logger({ serviceName: 'listBookshops' });
    logger.info(`Listing Bookshops: ${JSON.stringify(event)}`);
    try {
        const approved = event.queryStringParameters?.approved === "true";
        const includeDeleted = event.queryStringParameters?.includeDeleted === "true";

        const result = await dynamodb.send(
            new ScanCommand({
                TableName,
                FilterExpression: "approved = :approved" + (includeDeleted ? "" : " AND (attribute_not_exists(deleted) OR deleted = :notDeleted)"),
                ExpressionAttributeValues: {
                    ":approved": approved.toString(),
                    ...(includeDeleted ? {} : { ":notDeleted": "false" }),
                }
            })
        );

        const bookshops = result.Items || [];

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bookshops),
        };
    } catch (error) {
        logger.error("Error fetching bookshops:", { error: error instanceof Error ? error.message : String(error) });
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
}; 
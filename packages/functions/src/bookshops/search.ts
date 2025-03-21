import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TableName } from "../lib/dynamodb";
import { Logger } from '@aws-lambda-powertools/logger';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const logger = new Logger({ serviceName: 'searchCarShow' });
    logger.info(`Searching Car Shows: ${JSON.stringify(event)}`);
    try {
        const query = event.queryStringParameters?.q;
        const includeDeleted = event.queryStringParameters?.includeDeleted === "true";

        if (!query) {
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify([]),
            };
        }

        const searchQuery = query.toLowerCase().trim();

        // Search across all items and filter by conditions
        const filterExpression = `
            approved = :approved AND
            ${includeDeleted ? '' : '(attribute_not_exists(deleted) OR deleted = :notDeleted) AND'}
            (contains(#nameLower, :query) OR contains(#descriptionLower, :query) OR contains(#cityLower, :query) OR contains(#locationLower, :query) OR contains(#categoryLower, :query))
        `.trim();

        const result = await dynamodb.send(
            new ScanCommand({
                TableName,
                FilterExpression: filterExpression,
                ExpressionAttributeNames: {
                    "#nameLower": "nameLower",
                    "#descriptionLower": "descriptionLower",
                    "#cityLower": "cityLower",
                    "#locationLower": "locationLower",
                    "#categoryLower": "categoryLower",
                },
                ExpressionAttributeValues: {
                    ":approved": "true",
                    ":query": searchQuery,
                    ...(includeDeleted ? {} : { ":notDeleted": "false" }),
                },
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
        logger.error("Error searching car shows:", { error: error instanceof Error ? error.message : String(error) });
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
}; 
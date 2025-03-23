import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TableName } from "../lib/dynamodb";
import { Logger } from '@aws-lambda-powertools/logger';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const logger = new Logger({ serviceName: 'listBookshops' });
    logger.info(`Listing Bookshops: ${JSON.stringify(event)}`);
    try {
        const query = event.queryStringParameters?.q?.toLowerCase().trim();
        const approved = event.queryStringParameters?.approved === "true";
        const includeDeleted = event.queryStringParameters?.includeDeleted === "true";

        let filterExpressions = ["approved = :approved"];
        const expressionAttributeValues: Record<string, any> = {
            ":approved": approved.toString(),
        };

        if (!includeDeleted) {
            filterExpressions.push("(attribute_not_exists(deleted) OR deleted = :notDeleted)");
            expressionAttributeValues[":notDeleted"] = "false";
        }

        if (query) {
            filterExpressions.push("(contains(#nameLower, :query) OR contains(#categoriesLower, :query))");
            expressionAttributeValues[":query"] = query;
        }

        const result = await dynamodb.send(
            new ScanCommand({
                TableName,
                FilterExpression: filterExpressions.join(" AND "),
                ExpressionAttributeNames: query ? {
                    "#nameLower": "nameLower",
                    "#categoriesLower": "categoriesLower"
                } : undefined,
                ExpressionAttributeValues: expressionAttributeValues,
            })
        );

        const bookshops = (result.Items || []).sort((a, b) => a.nameLower.localeCompare(b.nameLower));

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
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TableName } from "../lib/dynamodb";
import { Logger } from '@aws-lambda-powertools/logger';


export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const logger = new Logger({ serviceName: 'deleteBookshop' });
    logger.info(`Deleting Bookshop: ${JSON.stringify(event)}`);

    try {
        const id = event.pathParameters?.id;
        const userId = (event.requestContext as any)?.accountId;

        if (!id) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ error: "Missing Bookshop ID" }),
            };
        }

        // Soft delete the bookshop
        const result = await dynamodb.send(
            new UpdateCommand({
                TableName,
                Key: {
                    PK: `BOOKSHOP#${id}`,
                },
                UpdateExpression: "SET deleted = :deleted, deletedAt = :deletedAt, deletedBy = :deletedBy",
                ExpressionAttributeValues: {
                    ":deleted": "true",
                    ":deletedAt": new Date().toISOString(),
                    ":deletedBy": userId || "unknown",
                },
                ReturnValues: "ALL_NEW",
            })
        );

        if (!result.Attributes) {
            return {
                statusCode: 404,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ error: "Bookshop not found" }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(result.Attributes),
        };
    } catch (error) {
        logger.error("Error deleting bookshop:", { error: error instanceof Error ? error.message : String(error) });
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
}; 
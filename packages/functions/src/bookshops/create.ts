import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TableName } from "../lib/dynamodb";
import { ulid } from "ulid";
import { Logger } from '@aws-lambda-powertools/logger';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const logger = new Logger({ serviceName: 'createBookshop' });

    logger.info(`Creating Bookshop: ${JSON.stringify(event)}`);

    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ error: "Missing request body" }),
            };
        }

        const body = JSON.parse(event.body);

        // Validate required fields
        if (!body.name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields. Name is required.' })
            };
        }


        const bookshop = {
            id: ulid(),
            ...body,
            // Add lowercase fields for searching
            nameLower: body.name.toLowerCase().trim(),
            categoriesLower: body.categories?.map(category => category.toLowerCase().trim()) || [],
            approved: "false",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await dynamodb.send(
            new PutCommand({
                TableName,
                Item: bookshop,
            })
        );

        return {
            statusCode: 201,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bookshop),
        };
    } catch (error) {
        logger.error("Error creating bookshop:", { error: error instanceof Error ? error.message : String(error) });
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
}; 
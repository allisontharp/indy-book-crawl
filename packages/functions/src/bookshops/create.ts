import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TableName } from "../lib/dynamodb";
import { ulid } from "ulid";
import { Logger } from '@aws-lambda-powertools/logger';
import type { CarShow, ShowTime } from "../../../../types";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const logger = new Logger({ serviceName: 'createCarShow' });

    logger.info(`Creating Car Show: ${JSON.stringify(event)}`);

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
        if (!body.name || !body.description || !body.date || !body.times) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields. Name, description, and date are required.' })
            };
        }

        // Validate time format
        const isValidTime = (time: string) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
        const invalidTimes = body.times.filter((time: ShowTime) => !isValidTime(time.time));
        if (invalidTimes.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid time format. Please use HH:mm format.' })
            };
        }

        const carShow = {
            id: ulid(),
            ...body,
            // Add lowercase fields for searching
            nameLower: body.name.toLowerCase().trim(),
            descriptionLower: body.description.toLowerCase().trim(),
            cityLower: body.city?.toLowerCase().trim() || '',
            locationLower: body.location?.toLowerCase().trim() || '',
            categoryLower: body.category?.toLowerCase().trim() || '',
            approved: "false", // Store as string for DynamoDB GSI
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const response = await dynamodb.send(
            new PutCommand({
                TableName,
                Item: carShow,
            })
        );

        return {
            statusCode: 201,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(carShow),
        };
    } catch (error) {
        logger.error("Error creating car show:", { error: error instanceof Error ? error.message : String(error) });
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
}; 
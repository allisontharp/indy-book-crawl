import { Logger } from "@aws-lambda-powertools/logger";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { dynamodb, TableName } from "../lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

// Define CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,PATCH",
    "Content-Type": "application/json",
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const logger = new Logger({ serviceName: 'patchCarShow' });

    // Handle OPTIONS request for CORS preflight
    if (event.requestContext.http.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: '',
        };
    }

    logger.info(`Patching Car Show: ${JSON.stringify(event)}`);

    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Missing request body' }),
            };
        }

        const body = JSON.parse(event.body);
        const id = event.pathParameters?.id || body.id;

        logger.info(`ID: ${id}`);

        if (!id) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Missing id parameter' }),
            };
        }

        const { ...updateData } = body;

        // Convert approved attribute to string if it exists
        if (updateData.hasOwnProperty('approved')) {
            updateData.approved = updateData.approved.toString();
        }

        // Create UpdateExpression and ExpressionAttributeNames/Values dynamically
        const updateFields = Object.keys(updateData);
        const updateExpressions: string[] = [];
        const expressionAttributeNames: { [key: string]: string } = {};
        const expressionAttributeValues: { [key: string]: any } = {};

        updateFields.forEach(field => {
            const value = updateData[field];
            if (value !== undefined && value !== null) {
                // Add the main field update
                updateExpressions.push(`#${field} = :${field}`);
                expressionAttributeNames[`#${field}`] = field;
                expressionAttributeValues[`:${field}`] = value;

                // Add corresponding lowercase field updates
                switch (field) {
                    case 'name':
                        updateExpressions.push('#nameLower = :nameLower');
                        expressionAttributeNames['#nameLower'] = 'nameLower';
                        expressionAttributeValues[':nameLower'] = value.toLowerCase().trim();
                        break;
                    case 'categories':
                        updateExpressions.push('#categoriesLower = :categoriesLower');
                        expressionAttributeNames['#categoriesLower'] = 'categoriesLower';
                        expressionAttributeValues[':categoriesLower'] = (value || []).map((cat: string) => cat.toLowerCase().trim());
                        break;
                }
            }
        });

        // Add updatedAt timestamp
        updateExpressions.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        const updateExpression = 'SET ' + updateExpressions.join(', ');

        logger.info(`Update Expression: ${updateExpression}`);
        logger.info(`Expression Attribute Names: ${JSON.stringify(expressionAttributeNames)}`);
        logger.info(`Expression Attribute Values: ${JSON.stringify(expressionAttributeValues)}`);

        const carShow = await dynamodb.send(
            new UpdateCommand({
                TableName: TableName,
                Key: { id },
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            })
        );

        logger.info(`Car Show updated: ${JSON.stringify(carShow)}`);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: carShow.Attributes
            })
        };
    } catch (error) {
        logger.error(`Error patching car show: ${error}`);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
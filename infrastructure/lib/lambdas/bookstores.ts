/// <reference types="node" />
import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Bookstore } from '../../../src/shared/types';
import { v4 as uuidv4 } from 'uuid';

// DynamoDB item type
interface BookstoreItem extends Omit<Bookstore, 'id'> {
    PK: string;  // BOOKSTORE#<id>
    SK: string;  // METADATA#<id>
    id: string;
    createdAt: string;
    updatedAt: string;
}

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME!;

// CORS headers for all responses
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // For production, replace with your specific domain
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
};

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        switch (event.httpMethod) {
            case 'GET':
                if (event.pathParameters?.id) {
                    return await getBookstore(event.pathParameters.id);
                }
                return await listBookstores(event.queryStringParameters || {});
            case 'POST':
                return await createBookstore(JSON.parse(event.body || '{}'));
            case 'PUT':
                if (!event.pathParameters?.id) {
                    throw new Error('Missing bookstore ID');
                }
                return await updateBookstore(event.pathParameters.id, JSON.parse(event.body || '{}'));
            case 'DELETE':
                if (!event.pathParameters?.id) {
                    throw new Error('Missing bookstore ID');
                }
                return await deleteBookstore(event.pathParameters.id);
            default:
                return {
                    statusCode: 405,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: 'Method not allowed' })
                };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
}

async function listBookstores(queryParams: { [key: string]: string | undefined }): Promise<APIGatewayProxyResult> {
    try {
        let result;

        // If category is provided, query the GSI
        if (queryParams?.category) {
            const params: DynamoDB.DocumentClient.QueryInput = {
                TableName: TABLE_NAME,
                IndexName: 'GSI1',
                KeyConditionExpression: 'GSI1PK = :category',
                ExpressionAttributeValues: {
                    ':category': `CATEGORY#${queryParams.category}`
                }
            };
            result = await dynamodb.query(params).promise();
        } else {
            // Use scan for listing all bookstores
            const params: DynamoDB.DocumentClient.ScanInput = {
                TableName: TABLE_NAME,
                FilterExpression: 'begins_with(PK, :pk)',
                ExpressionAttributeValues: {
                    ':pk': 'BOOKSTORE#'
                }
            };
            result = await dynamodb.scan(params).promise();
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(result.Items || [])
        };
    } catch (error) {
        console.error('Error in listBookstores:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Failed to list bookstores',
                details: error instanceof Error ? error.message : String(error)
            })
        };
    }
}

async function getBookstore(id: string): Promise<APIGatewayProxyResult> {
    const result = await dynamodb.get({
        TableName: TABLE_NAME,
        Key: {
            PK: `BOOKSTORE#${id}`,
            SK: `METADATA#${id}`
        }
    }).promise();

    if (!result.Item) {
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Bookstore not found' })
        };
    }

    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(result.Item)
    };
}

async function createBookstore(bookstore: Omit<Bookstore, 'id'>): Promise<APIGatewayProxyResult> {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const item: BookstoreItem = {
        PK: `BOOKSTORE#${id}`,
        SK: `METADATA#${id}`,
        id,
        ...bookstore,
        createdAt: timestamp,
        updatedAt: timestamp
    };

    await dynamodb.put({
        TableName: TABLE_NAME,
        Item: item
    }).promise();

    return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify(item)
    };
}

async function updateBookstore(id: string, updates: Partial<Omit<Bookstore, 'id'>>): Promise<APIGatewayProxyResult> {
    const existing = await dynamodb.get({
        TableName: TABLE_NAME,
        Key: {
            PK: `BOOKSTORE#${id}`,
            SK: `METADATA#${id}`
        }
    }).promise();

    if (!existing.Item) {
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Bookstore not found' })
        };
    }

    const timestamp = new Date().toISOString();
    const updatedItem: BookstoreItem = {
        ...(existing.Item as BookstoreItem),
        ...updates,
        updatedAt: timestamp
    };

    await dynamodb.put({
        TableName: TABLE_NAME,
        Item: updatedItem
    }).promise();

    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(updatedItem)
    };
}

async function deleteBookstore(id: string): Promise<APIGatewayProxyResult> {
    await dynamodb.delete({
        TableName: TABLE_NAME,
        Key: {
            PK: `BOOKSTORE#${id}`,
            SK: `METADATA#${id}`
        }
    }).promise();

    return {
        statusCode: 204,
        headers: corsHeaders,
        body: ''
    };
} 
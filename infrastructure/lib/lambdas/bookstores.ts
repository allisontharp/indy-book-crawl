import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Bookstore, BookstoreItem } from './types';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME!;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
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
                    body: JSON.stringify({ message: 'Method not allowed' })
                };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
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
            body: JSON.stringify({ message: 'Bookstore not found' })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify((result.Item as BookstoreItem).data)
    };
}

async function listBookstores(queryParams?: { [key: string]: string | undefined }): Promise<APIGatewayProxyResult> {
    let params: DynamoDB.DocumentClient.QueryInput = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'begins_with(PK, :pk)',
        ExpressionAttributeValues: {
            ':pk': 'BOOKSTORE#'
        }
    };

    // If category is provided, query the GSI
    if (queryParams?.category) {
        params = {
            TableName: TABLE_NAME,
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :category',
            ExpressionAttributeValues: {
                ':category': `CATEGORY#${queryParams.category}`
            }
        };
    }

    const result = await dynamodb.query(params).promise();

    return {
        statusCode: 200,
        body: JSON.stringify(result.Items?.map(item => (item as BookstoreItem).data) || [])
    };
}

async function createBookstore(bookstore: Bookstore): Promise<APIGatewayProxyResult> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const bookstoreItem: BookstoreItem = {
        PK: `BOOKSTORE#${id}`,
        SK: `METADATA#${id}`,
        GSI1PK: `CATEGORY#${bookstore.categories[0]}`,
        GSI1SK: `BOOKSTORE#${bookstore.name}`,
        type: 'bookstore',
        data: {
            ...bookstore,
            id
        }
    };

    await dynamodb.put({
        TableName: TABLE_NAME,
        Item: bookstoreItem
    }).promise();

    return {
        statusCode: 201,
        body: JSON.stringify(bookstoreItem.data)
    };
}

async function updateBookstore(id: string, bookstore: Partial<Bookstore>): Promise<APIGatewayProxyResult> {
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
            body: JSON.stringify({ message: 'Bookstore not found' })
        };
    }

    const updatedBookstore: BookstoreItem = {
        ...existing.Item as BookstoreItem,
        data: {
            ...(existing.Item as BookstoreItem).data,
            ...bookstore
        }
    };

    await dynamodb.put({
        TableName: TABLE_NAME,
        Item: updatedBookstore
    }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify(updatedBookstore.data)
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
        body: ''
    };
} 
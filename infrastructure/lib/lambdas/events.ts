import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Event, EventItem } from './types';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME!;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        switch (event.httpMethod) {
            case 'GET':
                if (event.pathParameters?.id) {
                    return await getEvent(event.pathParameters.id);
                }
                return await listEvents(event.queryStringParameters || {});
            case 'POST':
                return await createEvent(JSON.parse(event.body || '{}'));
            case 'PUT':
                if (!event.pathParameters?.id) {
                    throw new Error('Missing event ID');
                }
                return await updateEvent(event.pathParameters.id, JSON.parse(event.body || '{}'));
            case 'DELETE':
                if (!event.pathParameters?.id) {
                    throw new Error('Missing event ID');
                }
                return await deleteEvent(event.pathParameters.id);
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

async function getEvent(id: string): Promise<APIGatewayProxyResult> {
    const result = await dynamodb.get({
        TableName: TABLE_NAME,
        Key: {
            PK: `EVENT#${id}`,
            SK: `EVENT#${id}`
        }
    }).promise();

    if (!result.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Event not found' })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify((result.Item as EventItem).data)
    };
}

async function listEvents(queryParams?: { [key: string]: string | undefined }): Promise<APIGatewayProxyResult> {
    let params: DynamoDB.DocumentClient.QueryInput = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'begins_with(PK, :pk)',
        ExpressionAttributeValues: {
            ':pk': 'EVENT#'
        }
    };

    // If date is provided, query the GSI
    if (queryParams?.date) {
        params = {
            TableName: TABLE_NAME,
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :date',
            ExpressionAttributeValues: {
                ':date': `DATE#${queryParams.date}`
            }
        };
    }

    // If bookstoreId is provided, query by bookstore
    if (queryParams?.bookstoreId) {
        params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'SK = :bookstoreId',
            ExpressionAttributeValues: {
                ':bookstoreId': `BOOKSTORE#${queryParams.bookstoreId}`
            }
        };
    }

    const result = await dynamodb.query(params).promise();

    return {
        statusCode: 200,
        body: JSON.stringify(result.Items?.map(item => (item as EventItem).data) || [])
    };
}

async function createEvent(event: Event): Promise<APIGatewayProxyResult> {
    const id = uuidv4();
    const eventItem: EventItem = {
        PK: `EVENT#${id}`,
        SK: `BOOKSTORE#${event.bookstoreId}`,
        GSI1PK: `DATE#${event.startTime.split('T')[0]}`,
        GSI1SK: `EVENT#${event.name}`,
        type: 'event',
        data: {
            ...event,
            id
        }
    };

    await dynamodb.put({
        TableName: TABLE_NAME,
        Item: eventItem
    }).promise();

    return {
        statusCode: 201,
        body: JSON.stringify(eventItem.data)
    };
}

async function updateEvent(id: string, eventUpdate: Partial<Event>): Promise<APIGatewayProxyResult> {
    const existing = await dynamodb.get({
        TableName: TABLE_NAME,
        Key: {
            PK: `EVENT#${id}`,
            SK: `EVENT#${id}`
        }
    }).promise();

    if (!existing.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Event not found' })
        };
    }

    const updatedEvent: EventItem = {
        ...existing.Item as EventItem,
        data: {
            ...(existing.Item as EventItem).data,
            ...eventUpdate
        }
    };

    if (eventUpdate.startTime) {
        updatedEvent.GSI1PK = `DATE#${eventUpdate.startTime.split('T')[0]}`;
    }

    await dynamodb.put({
        TableName: TABLE_NAME,
        Item: updatedEvent
    }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify(updatedEvent.data)
    };
}

async function deleteEvent(id: string): Promise<APIGatewayProxyResult> {
    await dynamodb.delete({
        TableName: TABLE_NAME,
        Key: {
            PK: `EVENT#${id}`,
            SK: `EVENT#${id}`
        }
    }).promise();

    return {
        statusCode: 204,
        body: ''
    };
} 
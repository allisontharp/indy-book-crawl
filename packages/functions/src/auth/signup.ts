import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { Logger } from '@aws-lambda-powertools/logger';
const cognito = new CognitoIdentityProviderClient({});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const logger = new Logger({ serviceName: 'userSignup' });
    logger.info(`User Signup Starting`);

    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Missing request body" }),
            };
        }

        const { email, password, secretKey } = JSON.parse(event.body);

        if (!email || !password || !secretKey) {
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Email, password, and secret key are required" }),
            };
        }

        // Verify admin secret key
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            logger.info(`invalid key, received: ${secretKey}, expected: ${process.env.ADMIN_SECRET_KEY}`)
            return {
                statusCode: 403,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Invalid admin secret key" }),
            };
        }

        // Create user in Cognito
        logger.info(`Creating user in Cognito with userPoolId: ${process.env.USER_POOL_ID}`);
        const createCommand = new AdminCreateUserCommand({
            UserPoolId: process.env.USER_POOL_ID,
            Username: email,
            UserAttributes: [
                {
                    Name: "email",
                    Value: email,
                },
                {
                    Name: "email_verified",
                    Value: "true",
                },
                {
                    Name: "custom:role",
                    Value: "ADMIN",
                }
            ],
            MessageAction: "SUPPRESS", // Don't send welcome email
        });

        await cognito.send(createCommand);

        // Set permanent password
        const setPasswordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: process.env.USER_POOL_ID,
            Username: email,
            Password: password,
            Permanent: true,
        });

        await cognito.send(setPasswordCommand);

        return {
            statusCode: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Admin user created successfully",
                user: { email, role: "ADMIN" },
            }),
        };
    } catch (error: any) {
        logger.info(`Error during admin signup: ${error}`);

        if (error.name === "UsernameExistsException") {
            return {
                statusCode: 409,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "User with this email already exists" }),
            };
        }

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "An error occurred during signup" }),
        };
    }
}; 
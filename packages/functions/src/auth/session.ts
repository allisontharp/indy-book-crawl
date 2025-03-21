import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
    CognitoIdentityProviderClient,
    GetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        const accessToken = event.headers.authorization?.replace("Bearer ", "");

        if (!accessToken) {
            return {
                statusCode: 401,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Missing access token" }),
            };
        }

        // Get user information from the access token
        const command = new GetUserCommand({
            AccessToken: accessToken,
        });

        const response = await cognito.send(command);

        // Extract user attributes
        const attributes = response.UserAttributes?.reduce((acc: any, attr) => {
            if (attr.Name && attr.Value) {
                acc[attr.Name] = attr.Value;
            }
            return acc;
        }, {});

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user: {
                    email: attributes?.email,
                    role: attributes?.["custom:role"],
                    emailVerified: attributes?.email_verified === "true",
                }
            }),
        };
    } catch (error: any) {
        console.error("Error verifying session:", error);

        return {
            statusCode: error.name === "NotAuthorizedException" ? 401 : 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: error.name === "NotAuthorizedException"
                    ? "Invalid or expired token"
                    : "An error occurred while verifying session"
            }),
        };
    }
}; 
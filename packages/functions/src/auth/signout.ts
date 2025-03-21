import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
    CognitoIdentityProviderClient,
    GlobalSignOutCommand
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

        // Sign out user from all devices
        const command = new GlobalSignOutCommand({
            AccessToken: accessToken,
        });

        await cognito.send(command);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Successfully signed out" }),
        };
    } catch (error: any) {
        console.error("Error during sign out:", error);

        return {
            statusCode: error.name === "NotAuthorizedException" ? 401 : 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: error.name === "NotAuthorizedException"
                    ? "Invalid or expired token"
                    : "An error occurred during sign out"
            }),
        };
    }
}; 
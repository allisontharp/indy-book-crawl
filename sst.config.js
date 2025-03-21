import { NextjsSite, Bucket, Api, Table, Cognito } from "sst/constructs";
import { Tags } from "aws-cdk-lib"; // Import Tags
import {
  StringAttribute,
} from "aws-cdk-lib/aws-cognito";

export default {
  config(_input) {
    return {
      name: "indy-book-crawl",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function ApiStack({ stack }) {
      Tags.of(stack).add("ManagedBy", "sst")

      // Create DynamoDB table
      const table = new Table(stack, "Bookshop", {
        fields: {
          PK: "string",
          SK: "string",
        },
        primaryIndex: { partitionKey: "PK" },
      });

      // Add Cognito User Pool
      const auth = new Cognito(stack, "Auth", {
        login: ["email"],
        cdk: {
          userPool: {
            selfSignUpEnabled: false, // Only admins can create users
            passwordPolicy: {
              minLength: 8,
              requireLowercase: true,
              requireUppercase: true,
              requireDigits: true,
              requireSymbols: true,
            },
            customAttributes: {
              role: new StringAttribute({ minLength: 1, maxLength: 255, mutable: true })
            }
          },
          userPoolClient: {
            authFlows: {
              userPassword: true,
              adminUserPassword: true,
            },
          },
        },
      });

      const api = new Api(stack, "Api", {
        cors: {
          allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
          allowHeaders: ["*"],
          allowOrigins: ["*"],
          allowCredentials: false,
          maxAge: "1 day"
        },
        defaults: {
          function: {
            bind: [table, auth],
            permissions: [
              "cognito-idp:AdminCreateUser",
              "cognito-idp:AdminSetUserPassword",
            ],
            environment: {
              TABLE_NAME: table.tableName,
              ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY,
              USER_POOL_ID: auth.userPoolId,
              USER_POOL_CLIENT_ID: auth.userPoolClientId,
            },
          },
        },
        routes: {
          "GET /bookshops": "packages/functions/src/bookshops/list.handler",
          "POST /bookshops": "packages/functions/src/bookshops/create.handler",
          // "GET /bookshops/search": "packages/functions/src/bookshops/search.handler",
          // "GET /bookshops/{id}": "packages/functions/src/bookshops/get.handler",
          // "PATCH /bookshops/{id}": "packages/functions/src/bookshops/patch.handler",
          // "DELETE /bookshops/{id}": "packages/functions/src/bookshops/delete.handler",
          // // Geocoding routes
          // "GET /geocode": "packages/functions/src/geocode/get.handler",
          // Auth routes
          "POST /auth/signin": "packages/functions/src/auth/signin.handler",
          "POST /auth/signup": "packages/functions/src/auth/signup.handler",
          "POST /auth/signout": "packages/functions/src/auth/signout.handler",
          "GET /auth/session": "packages/functions/src/auth/session.handler",
        },
      });

      stack.addOutputs({
        ApiEndpoint: api.url,
        TableName: table.tableName,
        UserPoolId: auth.userPoolId,
        UserPoolClientId: auth.userPoolClientId,
      });

      app.stack(function Site({ stack }) {
        const bucket = new Bucket(stack, "Files");

        // Create our NextJS site
        const site = new NextjsSite(stack, "site", {
          environment: {
            // Set environment variables
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
            ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY,
            S3_BUCKET: bucket.bucketName,
            API_URL: api.url,
            NEXT_PUBLIC_API_URL: api.url,
          },
          buildCommand: "npm run build",
          buildOutput: ".next",
        });

        site.attachPermissions([bucket]);

        // Add outputs
        stack.addOutputs({
          SiteUrl: site.url,
        });
      });
    });
  },
};

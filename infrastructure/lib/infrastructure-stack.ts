import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamodb.Table(this, 'BookCrawlTable', {
      tableName: 'indy-book-crawl',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development - change for production
    });

    // Add GSIs
    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    // Cognito User Pool for Admins
    const userPool = new cognito.UserPool(this, 'BookCrawlAdminPool', {
      userPoolName: 'book-crawl-admin-pool',
      selfSignUpEnabled: false,
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'BookCrawlAdminPoolClient', {
      userPool,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
      },
    });

    // S3 bucket for website hosting
    const websiteBucket = new s3.Bucket(this, 'BookCrawlWebsiteBucket', {
      bucketName: 'indy-book-crawl-website',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'BookCrawlDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // Lambda Layer for shared code
    const lambdaLayer = new lambda.LayerVersion(this, 'SharedLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambdas')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Shared dependencies and types',
    });

    // Lambda functions
    const bookstoresFunction = new lambda.Function(this, 'BookstoresFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'bookstores.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambdas')),
      environment: {
        TABLE_NAME: table.tableName,
      },
      layers: [lambdaLayer],
      functionName: 'indy-book-crawl-bookstores',
    });

    const eventsFunction = new lambda.Function(this, 'EventsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'events.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambdas')),
      environment: {
        TABLE_NAME: table.tableName,
      },
      layers: [lambdaLayer],
      functionName: 'indy-book-crawl-events',
    });

    // Grant DynamoDB permissions to Lambda functions
    table.grantReadWriteData(bookstoresFunction);
    table.grantReadWriteData(eventsFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'BookCrawlApi', {
      restApiName: 'Book Crawl API',
      description: 'API for Indy Book Crawl website',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // For production, replace with specific origins
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Amz-Date',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
        maxAge: cdk.Duration.days(1),
        exposeHeaders: [
          'Access-Control-Allow-Origin',
          'Access-Control-Allow-Credentials',
        ],
      },
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'BookCrawlAuthorizer', {
      cognitoUserPools: [userPool],
      resultsCacheTtl: cdk.Duration.seconds(0),
    });

    // Add gateway responses to handle unauthorized requests with CORS headers
    const gatewayResponses: { [key: string]: apigateway.GatewayResponse } = {
      UNAUTHORIZED: new apigateway.GatewayResponse(this, 'Unauthorized', {
        restApi: api,
        type: apigateway.ResponseType.UNAUTHORIZED,
        responseHeaders: {
          'Access-Control-Allow-Origin': `'*'`,
          'Access-Control-Allow-Headers': `'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'`,
          'Access-Control-Allow-Methods': `'GET,POST,PUT,DELETE,OPTIONS'`,
          'Access-Control-Allow-Credentials': `'true'`
        },
        templates: {
          'application/json': '{"message": $context.error.messageString}'
        }
      }),
      ACCESS_DENIED: new apigateway.GatewayResponse(this, 'AccessDenied', {
        restApi: api,
        type: apigateway.ResponseType.ACCESS_DENIED,
        responseHeaders: {
          'Access-Control-Allow-Origin': `'*'`,
          'Access-Control-Allow-Headers': `'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'`,
          'Access-Control-Allow-Methods': `'GET,POST,PUT,DELETE,OPTIONS'`,
          'Access-Control-Allow-Credentials': `'true'`
        },
        templates: {
          'application/json': '{"message": $context.error.messageString}'
        }
      }),
      MISSING_AUTHENTICATION_TOKEN: new apigateway.GatewayResponse(this, 'MissingAuth', {
        restApi: api,
        type: apigateway.ResponseType.MISSING_AUTHENTICATION_TOKEN,
        responseHeaders: {
          'Access-Control-Allow-Origin': `'*'`,
          'Access-Control-Allow-Headers': `'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'`,
          'Access-Control-Allow-Methods': `'GET,POST,PUT,DELETE,OPTIONS'`,
          'Access-Control-Allow-Credentials': `'true'`
        },
        templates: {
          'application/json': '{"message": $context.error.messageString}'
        }
      })
    };

    // Add response headers to all integrations
    const defaultIntegrationResponses: apigateway.IntegrationResponse[] = [
      {
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'", // For production, replace with specific origins
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'",
          'method.response.header.Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'",
          'method.response.header.Access-Control-Allow-Credentials': "'true'"
        },
      },
      {
        statusCode: '400',
        selectionPattern: '.*[Bad Request].*',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'",
        },
      },
      {
        statusCode: '500',
        selectionPattern: '.*[Internal Server Error].*',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'",
        },
      }
    ];

    const defaultMethodResponses: apigateway.MethodResponse[] = [
      {
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Credentials': true,
        },
      },
      {
        statusCode: '400',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
        },
      },
      {
        statusCode: '500',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
        },
      }
    ];

    // Create Lambda integration with CORS headers
    const createLambdaIntegration = (fn: lambda.Function) => {
      return new apigateway.LambdaIntegration(fn, {
        proxy: true,
        integrationResponses: defaultIntegrationResponses,
      });
    };

    // API Resources and Methods
    const bookstores = api.root.addResource('bookstores');
    const bookstore = bookstores.addResource('{id}');
    const events = api.root.addResource('events');
    const event = events.addResource('{id}');

    // Public endpoints with CORS
    bookstores.addMethod('GET', createLambdaIntegration(bookstoresFunction), {
      methodResponses: defaultMethodResponses,
    });
    bookstore.addMethod('GET', createLambdaIntegration(bookstoresFunction), {
      methodResponses: defaultMethodResponses,
    });
    events.addMethod('GET', createLambdaIntegration(eventsFunction), {
      methodResponses: defaultMethodResponses,
    });
    event.addMethod('GET', createLambdaIntegration(eventsFunction), {
      methodResponses: defaultMethodResponses,
    });

    // Temporarily make POST public as well
    bookstores.addMethod('POST', createLambdaIntegration(bookstoresFunction), {
      methodResponses: defaultMethodResponses,
    });

    // Protected endpoints (require Cognito authentication)
    const protected_options: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: defaultMethodResponses,
    };

    // These still require auth
    bookstore.addMethod('PUT', createLambdaIntegration(bookstoresFunction), protected_options);
    bookstore.addMethod('DELETE', createLambdaIntegration(bookstoresFunction), protected_options);
    events.addMethod('POST', createLambdaIntegration(eventsFunction), protected_options);
    event.addMethod('PUT', createLambdaIntegration(eventsFunction), protected_options);
    event.addMethod('DELETE', createLambdaIntegration(eventsFunction), protected_options);

    // Output values
    new cdk.CfnOutput(this, 'TableName', {
      value: table.tableName,
      description: 'DynamoDB table name',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution URL',
    });

    new cdk.CfnOutput(this, 'ApiURL', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}

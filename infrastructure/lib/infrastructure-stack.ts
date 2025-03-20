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
    });

    const eventsFunction = new lambda.Function(this, 'EventsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'events.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambdas')),
      environment: {
        TABLE_NAME: table.tableName,
      },
      layers: [lambdaLayer],
    });

    // Grant DynamoDB permissions to Lambda functions
    table.grantReadWriteData(bookstoresFunction);
    table.grantReadWriteData(eventsFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'BookCrawlApi', {
      restApiName: 'Book Crawl API',
      description: 'API for Indy Book Crawl website',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'BookCrawlAuthorizer', {
      cognitoUserPools: [userPool],
    });

    // API Resources and Methods
    const bookstores = api.root.addResource('bookstores');
    const bookstore = bookstores.addResource('{id}');
    const events = api.root.addResource('events');
    const event = events.addResource('{id}');

    // Public endpoints
    bookstores.addMethod('GET', new apigateway.LambdaIntegration(bookstoresFunction));
    bookstore.addMethod('GET', new apigateway.LambdaIntegration(bookstoresFunction));
    events.addMethod('GET', new apigateway.LambdaIntegration(eventsFunction));
    event.addMethod('GET', new apigateway.LambdaIntegration(eventsFunction));

    // Protected endpoints (require Cognito authentication)
    const protected_options = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    bookstores.addMethod('POST', new apigateway.LambdaIntegration(bookstoresFunction), protected_options);
    bookstore.addMethod('PUT', new apigateway.LambdaIntegration(bookstoresFunction), protected_options);
    bookstore.addMethod('DELETE', new apigateway.LambdaIntegration(bookstoresFunction), protected_options);
    events.addMethod('POST', new apigateway.LambdaIntegration(eventsFunction), protected_options);
    event.addMethod('PUT', new apigateway.LambdaIntegration(eventsFunction), protected_options);
    event.addMethod('DELETE', new apigateway.LambdaIntegration(eventsFunction), protected_options);

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

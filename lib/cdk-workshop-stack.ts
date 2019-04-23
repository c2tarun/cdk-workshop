import cdk = require('@aws-cdk/cdk');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import lambda = require('@aws-cdk/aws-lambda');
import api = require('@aws-cdk/aws-apigateway');
import cognito = require('@aws-cdk/aws-cognito');
import iam = require('@aws-cdk/aws-iam');

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const quotesTable = new dynamodb.Table(this, 'Quotes', {
      tableName: 'Quotes',
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.String
      }
    });

    const randomQuoteLambda = new lambda.Function(this, 'RandomQuoteLambda', {
      runtime: lambda.Runtime.NodeJS810,
      handler: 'random_quote.handler',
      code: lambda.Code.asset('lambda')
    });
    quotesTable.grantReadWriteData(randomQuoteLambda);

    const randomQuoteApi = new api.LambdaRestApi(this, 'LambdaQuoteApi', {
      handler: randomQuoteLambda,
      proxy: false
    });

    const resource = randomQuoteApi.root.addResource('quote');
    resource.addMethod('GET', new api.LambdaIntegration(randomQuoteLambda), {
      authorizationType: api.AuthorizationType.IAM
    });

    this.addCorsOptions(randomQuoteApi.root);
    this.addCorsOptions(resource);

    // // Cognito stuff
    // // Creating user pool
    const userPool = new cognito.CfnUserPool(this, 'RandomQuoteUserPool', {
      autoVerifiedAttributes: [cognito.UserPoolAttribute.Email]
    });
    const userPoolClient = new cognito.CfnUserPoolClient(this, 'RandomQuoteUserPoolClient', {
      generateSecret: false,
      userPoolId: userPool.userPoolId
    });

    // Creating IdentityPool
    const identityPool = new cognito.CfnIdentityPool(this, 'RandomQuoteIdentityPool', {
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [{
        clientId: userPoolClient.userPoolClientId,
        providerName: userPool.userPoolProviderName
      }],
    });

    const identityPoolAuthRole = new iam.Role(this, 'RandomQuoteIdentityPoolAuthRole', {
      assumedBy: new iam.FederatedPrincipal('cognito-identity.amazonaws.com', {
        'ForAnyValue:StringLike': {
          'cognito-identity.amazonaws.com:amr': 'authenticated'
        }
      }, 'sts:AssumeRoleWithWebIdentity')
    });

    identityPoolAuthRole.addToPolicy(new iam.PolicyStatement()
      .addResource('*')
      .addAction('execute-api:Invoke')
      .allow()
    );

    new cognito.CfnIdentityPoolRoleAttachment(this, 'RoleAttachments', {
      identityPoolId: identityPool.identityPoolId,
      roles: {
        authenticated: identityPoolAuthRole.roleArn
      }
    });
  }

    /**
   * Custom method which will modify the API Gateway resource and enable CORS in it.
   * Source: https://github.com/awslabs/aws-cdk/issues/906#issuecomment-480554481
   * @param apiResource
   */
  addCorsOptions(apiResource: api.IRestApiResource) {
    apiResource.addMethod(
      "OPTIONS",
      new api.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Access-Control-Allow-Credentials": "'false'",
              "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,GET,PUT,POST,DELETE'"
            }
          }
        ],
        passthroughBehavior: api.PassthroughBehavior.Never,
        requestTemplates: {
          "application/json": '{"statusCode": 200}'
        }
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
              "method.response.header.Access-Control-Allow-Credentials": true,
              "method.response.header.Access-Control-Allow-Origin": true
            }
          }
        ]
      }
    );
  }
}

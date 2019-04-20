import cdk = require('@aws-cdk/cdk');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import lambda = require('@aws-cdk/aws-lambda');

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const quotesTable = new dynamodb.Table(this, 'Quotes', {
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

    quotesTable.grantReadWriteData(randomQuoteLambda.role);
  }
}

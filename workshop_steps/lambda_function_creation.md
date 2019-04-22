## Lambda Function
Steps:
1. Take dependency on [AWS Lambda Construct Library](https://awslabs.github.io/aws-cdk/refs/_aws-cdk_aws-lambda.html). To do that add `"@aws-cdk/aws-lambda": "^0.28.0"` package.json.
2. Import lambda in your `cdk-workshop-stack.ts` file. Add `import lambda = require('@aws-cdk/aws-lambda');` below your dynamo import.
3. Create the construct:
```typescript
    const randomQuoteLambda = new lambda.Function(this, 'RandomQuoteLambda', {
      runtime: lambda.Runtime.NodeJS810,
      handler: 'random_quote.handler',
      code: lambda.Code.asset('lambda')
    });
```
Construct creation is similar to DynamoDB Table but properties have `code` attribute which looks interesting. This attributed corresponds to the three ways in which we can provide code to a lambda function:

| Manual | CDK | Description |
| --- | --- | --- |
| Inline code editor. | `lambda.Code.inline('code')` | To upload lambda code inline. |
| Uploading zip file | `lambda.Code.asset('lambda/folder')` | A zip is created with lambda code and uploaded. |
| Uploading to an S3 Bucket and link | `lambda.Code.bucket('bucketName', 'key')` | Uploads zip to an S3 Bucket and links it to Lambda function |

For more details on this [click here](https://awslabs.github.io/aws-cdk/refs/_aws-cdk_aws-lambda.html#handler-code).

Thats it!! Well we did forget about permissions though :( In AWS nothing have permission to anything by default. That means our Lambda don't have permission to call DynamoDB.  
Now in world of clicks we would:
- Go to Lambda Function and find the Role.
- Click the role to go to IAM.
- Edit the policy..... You know what I mean.  

In CDK world just ask table nicely to let Lambda access it :)
```typescript
    quotesTable.grantReadWriteData(randomQuoteLambda);
```
`cdk diff`
```
Parameters
[+] Parameter RandomQuoteLambda/Code/S3Bucket RandomQuoteLambdaCodeS3BucketB5CE811D: {"Type":"String","Description":"S3 bucket for asset \"CdkWorkshopStack/RandomQuoteLambda/Code\""}
[+] Parameter RandomQuoteLambda/Code/S3VersionKey RandomQuoteLambdaCodeS3VersionKeyCC5363EA: {"Type":"String","Description":"S3 key for asset version \"CdkWorkshopStack/RandomQuoteLambda/Code\""}

Resources
[+] AWS::IAM::Role RandomQuoteLambda/ServiceRole RandomQuoteLambdaServiceRole4EEFCC0F
[+] AWS::IAM::Policy RandomQuoteLambda/ServiceRole/DefaultPolicy RandomQuoteLambdaServiceRoleDefaultPolicy735752DC
[+] AWS::Lambda::Function RandomQuoteLambda RandomQuoteLambda4EB192D77
```
`cdk deploy`
```
CdkWorkshopStack: creating CloudFormation changeset...
 0/5 | 07:14:22 | UPDATE_IN_PROGRESS   | AWS::CDK::Metadata    | CDKMetadata
 1/5 | 07:14:24 | UPDATE_COMPLETE      | AWS::CDK::Metadata    | CDKMetadata
 1/5 | 07:14:25 | CREATE_IN_PROGRESS   | AWS::IAM::Role        | RandomQuoteLambda/ServiceRole (RandomQuoteLambdaServiceRole4EEFCC0F)
 1/5 | 07:14:25 | CREATE_IN_PROGRESS   | AWS::IAM::Role        | RandomQuoteLambda/ServiceRole (RandomQuoteLambdaServiceRole4EEFCC0F) Resource creation Initiated
 2/5 | 07:14:42 | CREATE_COMPLETE      | AWS::IAM::Role        | RandomQuoteLambda/ServiceRole (RandomQuoteLambdaServiceRole4EEFCC0F)
 2/5 | 07:14:45 | CREATE_IN_PROGRESS   | AWS::IAM::Policy      | RandomQuoteLambda/ServiceRole/DefaultPolicy (RandomQuoteLambdaServiceRoleDefaultPolicy735752DC)
 2/5 | 07:14:47 | CREATE_IN_PROGRESS   | AWS::IAM::Policy      | RandomQuoteLambda/ServiceRole/DefaultPolicy (RandomQuoteLambdaServiceRoleDefaultPolicy735752DC) Resource creation Initiated
 3/5 | 07:14:55 | CREATE_COMPLETE      | AWS::IAM::Policy      | RandomQuoteLambda/ServiceRole/DefaultPolicy (RandomQuoteLambdaServiceRoleDefaultPolicy735752DC)
 3/5 | 07:14:58 | CREATE_IN_PROGRESS   | AWS::Lambda::Function | RandomQuoteLambda (RandomQuoteLambda4EB192D7)
 3/5 | 07:14:59 | CREATE_IN_PROGRESS   | AWS::Lambda::Function | RandomQuoteLambda (RandomQuoteLambda4EB192D7) Resource creation Initiated
 4/5 | 07:14:59 | CREATE_COMPLETE      | AWS::Lambda::Function | RandomQuoteLambda (RandomQuoteLambda4EB192D7)
 4/5 | 07:15:02 | UPDATE_COMPLETE_CLEA | AWS::CloudFormation::Stack | CdkWorkshopStack

 ✅  CdkWorkshopStack

Stack ARN:
arn:aws:cloudformation:us-west-2:222222222222:stack/CdkWorkshopStack/6ab94140-6375-11e9-bcaf-028e369bfbbe
```
![](https://media.giphy.com/media/vEgtLzJo8n7qg/giphy.gif)

For wise devs who are shaking their head, yes table name is hardcoded in Lambda. We can pass it as environment variable...... maybe later ;)

Lets test our Lambda, use following test events from AWS Console.  
For GET:
```json
{
  "httpMethod": "GET"
}
```

For POST:
```json
{
  "httpMethod": "POST",
  "body": "{\"quote\":\"It's not who I am underneath, but what I do that defines me.\",\"by\":\"Bruce Wayne\"}"
}
```

## [<<PREVIOUS](dynamodb_creation.md)
## [NEXT>>](api_gateway_creation.md)

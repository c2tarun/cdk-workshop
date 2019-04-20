# Introduction (WIP....)
AWS CDK is a software development framework for defining cloud infrastructure in code and provisioning it through AWS CloudFormation. The intention of this workshop is to introduce framework to developers as an alternative to writing Cloudformation. AWS CDK supports C#/.NET, Java, JavaScript, or TypeScript. For this workshop we'll be using TypeScript.

# Prerequisites
## Dev environment setup.
1. Request a AWS Account.
2. Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html).
3. Install [NodeJS](https://nodejs.org/en/).
4. Typescript support (Optional)
    * Install Typescript by running `npm install -g typescript`.
    * Typescript [support](https://www.typescriptlang.org/index.html#download-links) for your favorite text editor.
5. Install AWS CDK toolkit by running `npm install -g aws-cdk@0.28.0`

## CDK setup
CDK will use default aws cli profile configured on your host. For this workshop we'll create an IAM user with Administrative Privileges, and configure aws cli with its credentials.
1. Create IAM user with Admin Permissions using AWS Console.
    1. Navigate to IAM Management Console in your AWS account and click `Add Users`.
    2. Add a username `cdk-workshop-admin` and check *Programmatic Access*.
    3. On Next Permissions page select `Create Group` and name the group as `admin`.
    4. Select `Administrator Access` from list of policies.
    5. Add user to this Group.
    6. Next > Next > Create User.
    7. Make sure to save Access Key ID and Secret access key before navigating away from Create User confirmation page.
2. Run `aws configure` on your terminal:
    1. Enter Access Key ID and Secret access Key saved in step 1.8.
    2. Enter `us-west-2` or any [other region](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html) of your choice.

# Project Setup
1. Checkout this repository by running `git clone https://github.com/c2tarun/cdk-workshop.git -b start`
```
Files
.
├── bin
│   └── cdk-workshop.ts - This file is entry point of our application. This will load our stack defined in lib/cdk-workshop-stack.ts file. We don't have to modify this file for this workshop.
├── cdk.json - This tells cdk toolkit on how to run our app.
├── lib
│   └── cdk-workshop-stack.ts - This is our main stack. All resources we'll create will be added here, or imported here.
├── package-lock.json
├── package.json
└── tsconfig.json
```
2. Run `npm install && npm run watch` this will watch changes in typescript file and generate corresponding Types and JS file on detecting changes.
3. Open another terminal and navigate to `cdk-workshop` folder. Keep this terminal open we'll run cdk commands from here.

# Proposal
![Proposal](/images/proposal.svg)
## Resources
**DynamoDB** `Quotes` table will saved quotes and who said it.  
**Lambda** `RandomQuotesLambda` will handle GET and POST requests. On GET it'll return a random quotes from DynamoDB, on POST it'll get one quote from BODY and put it in DynamoDB.  
**API Gateway** To access our Lambda.  
**Cognito** `User Pool` for Authentication. `Identity Pool` to grant permission to invoke our API Gateway.  

## Bonus
**Website** A website to authenticate with Cognito and fetch random quotes.

# Context
![](https://media.giphy.com/media/7getOyWn0qT9C/giphy.gif)  
We are going to use [AWS CDK](https://docs.aws.amazon.com/CDK/latest/userguide/what-is.html) (Cloud Development Kit) to create the proposed application. Why are we using AWS CDK over other options?

1. Clicking around in AWS Console is not an option.
    * There is no way for you to get your work reviewed.
    * There is no guarantee that you'll be able to replicate everything in a complex stack.
    * Clicking cannot be automated, shared and has to be done by humans. Humans are not known for being super efficient.
    * And most dangerours, if you are clicking at night and feeling sleepy, you are one click away from nuking your infrastructure.
2. Cloudformation is hard and usually way too long which makes it difficult to review.
3. We love coding. :)  
*But I hate coding and I am great at League of Legends. I can time and click all night.*  
Imaging you are building world's most secure AWS VPC. You researched on every small setting and have been working on it for hours. You hit save and BOOM!!
![](/images/timeout.png)

AWS CDK is a software development framework for defining cloud infrastructure in code and provisioning it through AWS CloudFormation. AWS CDK supports Java, JavaScript, TypeScript and even C#. For this workshop we'll be using TypeScript because we love code prediction and autocomplete.

[**Construct**](https://docs.aws.amazon.com/CDK/latest/userguide/constructs.html) in terms of CDK is a Cloud Resource, it can be a simple resource like an S3 Bucket or Lambda Function or a complex resource like VPC combining several simple constructs. In short, everything in AWS CDK is a construct. Construct object on creation requires three fields **stack**, **name** and **props**.

Constructs are weird in one way. If you want to create an AWS Resource, simply create object of the corresponding construct. There is no extra call needed to `.build()` the construct. Due to this reason most of the code examples available are using constructors for pretty much writing all the code. We can split out things into method, but we still need to call those methods from constructors. Whole CDK projects feels like Guice Module with all the providers called from constructor  ¯\\__(ツ)__/¯.

For this workshop we'll create everything under CdkWorkshopStack constructor in `cdk-workshop-stack.ts` file.

# Lets Start
![](https://media.giphy.com/media/3ornjIhZGFWpbcGMAU/giphy.gif)  
Before we start doing anything please run `cdk bootstrap` in your project. This will create an S3 bucket that `cdk deploy` will use to store synthesized templates and the related assets before triggering CloudFormation stack update. For more details [check](https://github.com/awslabs/aws-cdk/blob/master/packages/aws-cdk/README.md#cdk-bootstrap).

We'll create resources in the order in Proposal section. So lets start with:
### DynamoDB Table
To create a DynamoDB Table we need to do three things:
1. Take dependency on [AWS DynamoDB Construct Library](https://awslabs.github.io/aws-cdk/refs/_aws-cdk_aws-dynamodb.html). To do that add `"@aws-cdk/aws-dynamodb": "^0.28.0"` in dependecies of your package.json. Run `npm install` so that dependency is downloaded to your node_modules. *At the time of writing of this workshop I need version 0.28.0 for enabling CORS in API Gateway. More details when we create API Gateway :)*
2. Import dynamodb in your `cdk-workshop-stack.ts` file. Add `import dynamodb = require('@aws-cdk/aws-dynamodb');` among other imports in the file.
3. Create the construct, in constructor add following code:
```typescript
    const quotesTable = new dynamodb.Table(this, 'Quotes', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.String
      }
    });
```
In this construct we are passing `this` which is current stack. This tells Table on which stack to attach to. Apart from it, its just name and properties.

That's it. We can configure other attributes of the table, but for now we'll use the default values. Run `cdk diff` and validate if you are seeing following output.
```js
Stack CdkWorkshopStack
Resources
[+] AWS::DynamoDB::Table Quotes Quotes4DCFF1CF
```
Run `cdk deploy` to create the table.
```
CdkWorkshopStack: deploying...
CdkWorkshopStack: creating CloudFormation changeset...
 0/3 | 15:50:23 | CREATE_IN_PROGRESS   | AWS::CDK::Metadata   | CDKMetadata
 0/3 | 15:50:23 | CREATE_IN_PROGRESS   | AWS::DynamoDB::Table | Quotes (Quotes4DCFF1CF)
 0/3 | 15:50:24 | CREATE_IN_PROGRESS   | AWS::DynamoDB::Table | Quotes (Quotes4DCFF1CF) Resource creation Initiated
 0/3 | 15:50:25 | CREATE_IN_PROGRESS   | AWS::CDK::Metadata   | CDKMetadata Resource creation Initiated
 1/3 | 15:50:25 | CREATE_COMPLETE      | AWS::CDK::Metadata   | CDKMetadata
 2/3 | 15:50:54 | CREATE_COMPLETE      | AWS::DynamoDB::Table | Quotes (Quotes4DCFF1CF)
 3/3 | 15:50:56 | CREATE_COMPLETE      | AWS::CloudFormation::Stack | CdkWorkshopStack

 ✅  CdkWorkshopStack

Stack ARN:
arn:aws:cloudformation:us-west-2:222222222222:stack/CdkWorkshopStack/7dad4dd0-62f5-11e9-9318-066b98e74c72
```
![](https://media.giphy.com/media/yoJC2GnSClbPOkV0eA/giphy.gif)

### Lambda Function
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
Construct creation is similar to Dynamo Table but properties have `code` attribute which looks interesting. If we create lambda manually, we can provide the code in three ways:
1. Inline code editor.
2. Uploading zip file.
3. Uploading a zip file to s3 and providing a link.
`lambda.Code` gives us access to these ways of providing code to our lambda. 
1. lambda.Code.inline('code goes here') is the way for providing code inline.
2. lambda.Code.asset('path/to/lambda') will look for the folder provided, zip it and link it to lambda by uploding it to CDK S3 bucket which we created by running `cdk bootstrap`.
3. lambda.Code.bucket() will allow us to provide an S3 Bucket and a key.
For more details on this [click here](https://awslabs.github.io/aws-cdk/refs/_aws-cdk_aws-lambda.html#handler-code).

TODO: Convert above to github tables.

Thats it!! Well we did forget about permissions though :( In AWS nothing have permission to anything by default. That means our Lambda don't have permission to call DynamoDB.  
Now in world of clicks we would:
- Go to Lambda Function and find the Role.
- Go to IAM and again find the Role.
- Find the policy attac..... You know what I mean.  

In CDK world just ask table nicely to let Lambda access it :)
```typescript
    quotesTable.grantReadWriteData(randomQuoteLambda.role);
```
`cdk diff`
```
Parameters
[+] Parameter RandomQuoteLambda/Code/S3Bucket RandomQuoteLambdaCodeS3BucketB5CE811D: {"Type":"String","Description":"S3 bucket for asset \"CdkWorkshopStack/RandomQuoteLambda/Code\""}
[+] Parameter RandomQuoteLambda/Code/S3VersionKey RandomQuoteLambdaCodeS3VersionKeyCC5363EA: {"Type":"String","Description":"S3 key for asset version \"CdkWorkshopStack/RandomQuoteLambda/Code\""}

Resources
[+] AWS::IAM::Role RandomQuoteLambda/ServiceRole RandomQuoteLambdaServiceRole4EEFCC0F
[+] AWS::IAM::Policy RandomQuoteLambda/ServiceRole/DefaultPolicy RandomQuoteLambdaServiceRoleDefaultPolicy735752DC
[+] AWS::Lambda::Function RandomQuoteLambda RandomQuoteLambda4EB192D7
```
`cdk deploy`
```
CdkWorkshopStack: creating CloudFormation changeset...
 0/5 | 17:20:31 | UPDATE_IN_PROGRESS   | AWS::CloudFormation::Stack | CdkWorkshopStack User Initiated

 0/5 | 17:20:59 | CREATE_IN_PROGRESS   | AWS::IAM::Role        | RandomQuoteLambda/ServiceRole (RandomQuoteLambdaServiceRole4EEFCC0F)
 0/5 | 17:21:00 | UPDATE_IN_PROGRESS   | AWS::CDK::Metadata    | CDKMetadata
 0/5 | 17:21:00 | CREATE_IN_PROGRESS   | AWS::IAM::Role        | RandomQuoteLambda/ServiceRole (RandomQuoteLambdaServiceRole4EEFCC0F) Resource creation Initiated
 1/5 | 17:21:02 | UPDATE_COMPLETE      | AWS::CDK::Metadata    | CDKMetadata
 2/5 | 17:21:18 | CREATE_COMPLETE      | AWS::IAM::Role        | RandomQuoteLambda/ServiceRole (RandomQuoteLambdaServiceRole4EEFCC0F)
 2/5 | 17:21:21 | CREATE_IN_PROGRESS   | AWS::IAM::Policy      | RandomQuoteLambda/ServiceRole/DefaultPolicy (RandomQuoteLambdaServiceRoleDefaultPolicy735752DC)
 2/5 | 17:21:21 | CREATE_IN_PROGRESS   | AWS::IAM::Policy      | RandomQuoteLambda/ServiceRole/DefaultPolicy (RandomQuoteLambdaServiceRoleDefaultPolicy735752DC) Resource creation Initiated
 3/5 | 17:21:30 | CREATE_COMPLETE      | AWS::IAM::Policy      | RandomQuoteLambda/ServiceRole/DefaultPolicy (RandomQuoteLambdaServiceRoleDefaultPolicy735752DC)
 3/5 | 17:21:33 | CREATE_IN_PROGRESS   | AWS::Lambda::Function | RandomQuoteLambda (RandomQuoteLambda4EB192D7)
 3/5 | 17:21:34 | CREATE_IN_PROGRESS   | AWS::Lambda::Function | RandomQuoteLambda (RandomQuoteLambda4EB192D7) Resource creation Initiated
 4/5 | 17:21:34 | CREATE_COMPLETE      | AWS::Lambda::Function | RandomQuoteLambda (RandomQuoteLambda4EB192D7)

 ✅  CdkWorkshopStack

Stack ARN:
arn:aws:cloudformation:us-west-2:222222222222:stack/CdkWorkshopStack/7dad4dd0-62f5-11e9-9318-066b98e74c72
```
![](https://media.giphy.com/media/vEgtLzJo8n7qg/giphy.gif)
# Introduction
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
1. Create IAM user with Admin Permissions using AWS Console (this is dangerous and admin credentials should be managed carefully, PLEASE NEVER DO THIS IN PRODUCTION).
    1. Navigate to IAM Management Console in your AWS account and click `Add Users`.
    2. Add a username `cdk-workshop-admin` and check *Programmatic Access*.
    3. On Next page `Attach existing Policies directly`.
    4. Select `Administrator Access` from list of policies.
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
2. Cloudformation:
    * is hard and usually way too long which makes it difficult to review.
    * You cannot test it without running which is frustrating.
3. We love coding. :)  
*But I hate coding and I love clicking.*  
Imaging you are building world's most secure AWS VPC. You researched on every small setting and have been working on it for hours. You hit save and BOOM!!
![](/images/timeout.png)

## CDK
AWS CDK is a software development framework for defining cloud infrastructure in code and provisioning it through AWS CloudFormation. AWS CDK supports Java, JavaScript, TypeScript and even C#. For this workshop we'll be using TypeScript because we love code prediction and autocomplete.

[**Construct**](https://docs.aws.amazon.com/CDK/latest/userguide/constructs.html) in terms of CDK is a Cloud Resource, it can be a simple resource like an S3 Bucket or Lambda Function or a complex resource like VPC combining several simple constructs. In short, everything in AWS CDK is a construct. Construct object on creation requires three fields **stack**, **name** and **props**.

Constructs are weird in one way. If you want to create an AWS Resource, simply create object of the corresponding construct. There is no extra call needed to `.build()` the construct. Due to this reason most of the code examples available are using constructors for pretty much writing all the code. We can split out things into method, but we still need to call those methods from constructors. Whole CDK projects feels like Guice Module with all the providers called from constructor  ¯\\__(ツ)__/¯.

For this workshop we'll create everything under CdkWorkshopStack constructor in `cdk-workshop-stack.ts` file.

# Let's Start
![](https://media.giphy.com/media/3ornjIhZGFWpbcGMAU/giphy.gif)  
Before we start though please run `cdk bootstrap` in your project. This will create an S3 bucket that `cdk deploy` will use to store synthesized templates and the related assets before triggering CloudFormation stack update. For more details [check](https://github.com/awslabs/aws-cdk/blob/master/packages/aws-cdk/README.md#cdk-bootstrap).

## [NEXT>>](workshop_steps/dynamodb_creation.md)

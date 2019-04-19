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
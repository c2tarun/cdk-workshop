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
1. Checkout this repository by running `git clone https://github.com/c2tarun/cdk-workshop.git`
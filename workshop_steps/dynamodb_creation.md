## DynamoDB Table
To create a DynamoDB Table we need to do three things:
1. Take dependency on [AWS DynamoDB Construct Library](https://awslabs.github.io/aws-cdk/refs/_aws-cdk_aws-dynamodb.html). To do that add `"@aws-cdk/aws-dynamodb": "^0.28.0"` in dependecies of your package.json. Your dependencies will look like this:
```json
"dependencies": {
    "@aws-cdk/cdk": "^0.28.0",
    "@aws-cdk/aws-dynamodb": "^0.28.0",
    "source-map-support": "^0.5.9"
  }
```
2. Run `npm install` so that dependency is downloaded to your node_modules.
3. Import dynamodb in your `cdk-workshop-stack.ts` file. Add `import dynamodb = require('@aws-cdk/aws-dynamodb');` among other imports in the file.
4. Create the construct, in constructor add following code:
```typescript
    // The code that defines your stack goes here
    const quotesTable = new dynamodb.Table(this, 'Quotes', {
      tableName: 'Quotes',
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.String
      }
    });
```
Construct `dynamo.Table` receives `this`, the stack in this it'll be created.  
`'Quotes'` construct id, this is used by cdk to determine to find construct in the stack. If another construct exists with the same name it'll be updated.  
`{}` props. For every construct there is a Props interface which mentions what is required and optional as properties. For DynamoDB Table it is [TableProps](https://awslabs.github.io/aws-cdk/refs/_aws-cdk_aws-dynamodb.html#@aws-cdk/aws-dynamodb.TableProps)

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
<sup>https://media.giphy.com/media/yoJC2GnSClbPOkV0eA/giphy.gif</sup>

## [<<PREVIOUS](../README.md)
## [NEXT>>](lambda_function_creation.md)

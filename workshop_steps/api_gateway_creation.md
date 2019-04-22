## API Gateway.
You know the dance:
1. `"@aws-cdk/aws-apigateway": "^0.28.0"` in package.json followed by `npm install`.
2. `import api = require('@aws-cdk/aws-apigateway');` into your stack.
3. Construct api gateway by:
```typescript
new api.LambdaRestApi(this, 'LambdaQuoteApi', {
    handler: randomQuoteLambda
});
```
Lets break down this code a bit. Most interesting part so far in this code is [`LambdaRestApi`](https://awslabs.github.io/aws-cdk/refs/_aws-cdk_aws-apigateway.html#lambdarestapi) which obviously an extension of [`RestApi`](https://awslabs.github.io/aws-cdk/refs/_aws-cdk_aws-apigateway.html#restapi). Standard process of creating an api is to:  
1. Create an object of `RestApi`
2. Add resources and Method to it.
3. Add handler to Methods etc.

`LambdaRestApi` requires an handler to be provided and it creates `Proxy` resource with `Any` method by default. We can still add custom resources and method.

`cdk diff`
```
[+] AWS::Lambda::Permission RandomQuoteLambda/ApiPermission.ANY.. RandomQuoteLambdaApiPermissionANY250CD9A2
[+] AWS::Lambda::Permission RandomQuoteLambda/ApiPermission.Test.ANY.. RandomQuoteLambdaApiPermissionTestANYAD822313
[+] AWS::Lambda::Permission RandomQuoteLambda/ApiPermission.ANY..{proxy+} RandomQuoteLambdaApiPermissionANYproxy583B81F4
[+] AWS::Lambda::Permission RandomQuoteLambda/ApiPermission.Test.ANY..{proxy+} RandomQuoteLambdaApiPermissionTestANYproxy1903CD45
[+] AWS::ApiGateway::RestApi LambdaQuoteApi LambdaQuoteApiD85EA255
[+] AWS::ApiGateway::Deployment LambdaQuoteApi/Deployment LambdaQuoteApiDeployment8A0731E53d79c6a330340e9d42b16ca90e3fc6d5
[+] AWS::ApiGateway::Stage LambdaQuoteApi/DeploymentStage.prod LambdaQuoteApiDeploymentStageprod06B04DE2
[+] AWS::IAM::Role LambdaQuoteApi/CloudWatchRole LambdaQuoteApiCloudWatchRole330239FE
[+] AWS::ApiGateway::Account LambdaQuoteApi/Account LambdaQuoteApiAccountBD6B0ABB
[+] AWS::ApiGateway::Resource LambdaQuoteApi/Default/{proxy+} LambdaQuoteApiproxy51F4C83B
[+] AWS::ApiGateway::Method LambdaQuoteApi/Default/{proxy+}/ANY LambdaQuoteApiproxyANY669C883C
[+] AWS::ApiGateway::Method LambdaQuoteApi/Default/ANY LambdaQuoteApiANY105BDB85
```

`cdk deploy`
```
.... lot of CFN event logs
 11/14 | 05:29:50 | CREATE_COMPLETE      | AWS::ApiGateway::Account    | LambdaQuoteApi/Account (LambdaQuoteApiAccountBD6B0ABB)
 12/14 | 05:29:59 | CREATE_COMPLETE      | AWS::Lambda::Permission     | RandomQuoteLambda/ApiPermission.ANY.. (RandomQuoteLambdaApiPermissionANY250CD9A2)
 13/14 | 05:30:00 | CREATE_COMPLETE      | AWS::Lambda::Permission     | RandomQuoteLambda/ApiPermission.ANY..{proxy+} (RandomQuoteLambdaApiPermissionANYproxy583B81F4)
 13/14 | 05:30:04 | UPDATE_COMPLETE_CLEA | AWS::CloudFormation::Stack  | CdkWorkshopStack

 ✅  CdkWorkshopStack

Outputs:
CdkWorkshopStack.LambdaQuoteApiEndpointCA5FEBD2 = https://murjqe2q20.execute-api.us-west-2.amazonaws.com/prod/

Stack ARN:
arn:aws:cloudformation:us-west-2:222222222222:stack/CdkWorkshopStack/5e9ec6f0-639d-11e9-b731-02a485342252
```
![](https://media.giphy.com/media/l3vQY4uui06iabkli/giphy.gif)

Lets test our API by running `curl <your-api-gateway-endpoint>`  
Response: `{"quote":"The computer was born to solve problems that did not exist before.","by":"Bill Gates"}`

Yay!!!!

However

![](/images/2z3whd.jpg)

Thats fair, lets secure our API by adding following to `LambdaRestApiProps`:
```js
options: {
defaultMethodOptions: {
    authorizationType: api.AuthorizationType.IAM
  }
}
```
`defaultMethodOptions` of type [MethodOptions](https://awslabs.github.io/aws-cdk/refs/_aws-cdk_aws-apigateway.html#@aws-cdk/aws-apigateway.MethodOptions) have a configuration setting of authorizationType. On setting authorizationType here, it'll be come default authorization type for every resource and method under your API.  
*But why is it wrapped in `options`*: Like we discussed before `LambdaRestApi` is an extension of `RestApi` similarly `LambdaRestApiProps` is also a **wrapper** around `RestApiProps` which have mandatory field `handler` and an additional field `options` of type `RestApiProps`. Check [this](https://awslabs.github.io/aws-cdk/refs/_aws-cdk_aws-apigateway.html#@aws-cdk/aws-apigateway.LambdaRestApiProps) for more details.

![](/images/com_over_inh.jpeg)

`cdk diff`
```
[-] AWS::ApiGateway::Deployment LambdaQuoteApiDeployment8A0731E53d79c6a330340e9d42b16ca90e3fc6d5 destroy
[+] AWS::ApiGateway::Deployment LambdaQuoteApi/Deployment LambdaQuoteApiDeployment8A0731E5014afccdbfe42583dc48cfeedd6374fa
[~] AWS::ApiGateway::Stage LambdaQuoteApi/DeploymentStage.prod LambdaQuoteApiDeploymentStageprod06B04DE2
 └─ [~] DeploymentId
     └─ [~] .Ref:
         ├─ [-] LambdaQuoteApiDeployment8A0731E53d79c6a330340e9d42b16ca90e3fc6d5
         └─ [+] LambdaQuoteApiDeployment8A0731E5014afccdbfe42583dc48cfeedd6374fa
[~] AWS::ApiGateway::Method LambdaQuoteApi/Default/{proxy+}/ANY LambdaQuoteApiproxyANY669C883C
 └─ [~] AuthorizationType
     ├─ [-] NONE
     └─ [+] AWS_IAM
[~] AWS::ApiGateway::Method LambdaQuoteApi/Default/ANY LambdaQuoteApiANY105BDB85
 └─ [~] AuthorizationType
     ├─ [-] NONE
     └─ [+] AWS_IAM
```
`cdk deploy`

Lets run our trusty `curl api-endpoint`
```
{"message":"Missing Authentication Token"}
```

Yay!! We are **Secure**.  
But how do we know if API is still working what if we broke it?????

Okay!! Lets use your accounts master key which we setup in Prerequisite of this workshop, if you don't have it memorized please run following command.
```
cat ~/.aws/credentials
```

This command should give you access to your admin access key and secret key. Now:
1. Open Postman
2. Create a GET request and enter your endpoint.
3. Click on Authorization and select Type as `AWS Signature`.
4. Enter your access_key, secret_key and region. You can leave other fields blank.
5. Send

Nice!! Lets do a quick comparison with CFN template which we had to write for the whole thing:

`cdk synth | wc -l` vs `cat lib/cdk-workshop-stack.ts | wc -l`  
347 vs  35

![](https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif)


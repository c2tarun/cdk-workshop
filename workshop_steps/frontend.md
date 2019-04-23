## Random Quote Website.

```
This section is very rushed and can be considered as Work in Progress, but it'll get the job done.....
```
For this section we'll use a very basic web app written in Vue which will use Cognito for authentication. Once authenticated it'll access API Gateway to fetch random quotes.

But first we have to enable CORS. Add this method outside of your constructor as a method in `CdkWorkshopStack` class in `cdk-workshop-stack.ts` file.
Explanation: Pending
```typescript
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
```
Replace LambdaRestApi creation call with:
```typescript
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
```
Please notice few changes, we are disabling Proxy here because in order to enable CORS we have to add OPTIONS method with AuthType as NONE. CDK didn't allow me to add method to Proxy hence I disabled proxy and created a resource. 

1. `git clone https://github.com/c2tarun/random_quote_website.git`
2. Open `src/main.js` file and fill details about Cognito User Pool and Identity Pool.
   Sample Values:
   ```
      identityPoolId: us-west-2:36ff72b3-e36c-2222-88ed-e5d522e477fc
      identityPoolName: RandomQuoteIdentityPool_UTIXKlCbchMB
      UserPool Id: us-west-2_6xXZqkmmO
      App client id: 48alm118d7hrcttmds4567894v
      API Gateway endpoint: https://1fpfajsbfb.execute-api.us-west-2.amazonaws.com/prod
      
      Note that there is no '/' after prod
   ```
3. To find these details go to your AWS Console inside Cognito Identity Pool. Find and open your identity pool. Once you collect identity pool information scroll down and expand `Authentication Providers` to get user pool information.
4. Click on `Edit Identity Pool` at top right hand corner. On edit page, you'll be able to find all the details about Cognito.
5. Also update region and your API Gateway endpoint.
6. cd into checked out project and run `npm install && npm run serve`

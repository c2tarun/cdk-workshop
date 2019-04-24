## Cognito
Congratulations on making this far. Creating Cognito is slightly more work than creating previous two resources. But we'll do it anyway :). Before we do that a small definition of various resources we are going to create.

*Note: This section is going to be long so I'll not put output of `cdk diff` and `cdk deploy`.* 

## Amazon Cognito Identity Pools (Federated Identities)
Amazon Cognito identity pools (federated identities) enables you to create unique identities for your users and federate them with identity providers. This is just a fancy way of saying that once a user is authenticated they'll get temporary credentials which they can use to perform certain operations. What operations are explained later.
Identity pool have two major components attached to it.

### Amazon Cognito User Pools
A user pool is a user directory in Amazon Cognito. Cognito User Pool is responsible about storing and managing user details and their credentials.

### IAM Roles
In process of creating identity Pool we also have to provide an IAM role. This is the role our authenticated user can assume with their temporary credentials. User can perform all the actions permitted in this role.

Let's start this section of the workshop:

![](https://media.giphy.com/media/xT39DpdCuul778HXmU/giphy.gif)

1. `"@aws-cdk/aws-cognito": "^0.28.0"` to package.json.
2. `"@aws-cdk/aws-iam": "^0.28.0"` to package.json and `npm install`.
3. Your dependencies will look like:
```json
"dependencies": {
    "@aws-cdk/cdk": "^0.28.0",
    "@aws-cdk/aws-dynamodb": "^0.28.0",
    "@aws-cdk/aws-lambda": "^0.28.0",
    "@aws-cdk/aws-apigateway": "^0.28.0",
    "@aws-cdk/aws-cognito": "^0.28.0",
    "@aws-cdk/aws-iam": "^0.28.0",
    "source-map-support": "^0.5.9"
  }
```
4. Import following in `cdk-workshop-stack.ts` file:
```typescript
import cognito = require('@aws-cdk/aws-cognito');
import iam = require('@aws-cdk/aws-iam');
```

## User Pool and Client Creation
Add following code to your `stack.ts` file:
```typescript
    // Cognito User Pool
    const userPool = new cognito.CfnUserPool(this, 'RandomQuoteUserPool', {
      autoVerifiedAttributes: [cognito.UserPoolAttribute.Email]
    });

    // Cognito User Pool Client
    const userPoolClient = new cognito.CfnUserPoolClient(this, 'RandomQuoteUserPoolClient', {
      generateSecret: false,
      userPoolId: userPool.userPoolId
    });
```
In first three lines we are creating Cognito User Pool. `AutoVerifiedAttributes` is a not so good name for the list of attributes which Amazon Cognito will verify automatically. This verification is required for account to enabled.
In second section of the code block we are registering a client which can use the linked user pool to authenticate its users. This client is named `App Client` in AWS Console and `UserPoolClient` in Cloudformation or CDK. Notice that we are not generating any secret. This will allow any web application with UserPoolId and UserPoolClientId to access the user pool.

`cdk deploy`

## Identity Pools
Add following code below User Pool Client creation code.
```typescript
    const identityPool = new cognito.CfnIdentityPool(this, 'RandomQuoteIdentityPool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: userPoolClient.userPoolClientId,
        providerName: userPool.userPoolProviderName
      }],
    });
```
Okay let's break it down
Cognito Identity Pool have the ability to allow unauthenticated guest (limited) access. We don't need this so we are setting `allowUnauthenticatedIdentities` to false.
Cognito Identity Pool only grant Federated access, it do not validate a user's identity. This task is delegated to an Identity Provider. In our case Cognito User Pool is our identity provider.

![](https://media.giphy.com/media/l49JU1snMAYOc0dKE/giphy.gif)  
<sup>https://media.giphy.com/media/l49JU1snMAYOc0dKE/giphy.gif</sup>

**ALMOST!!**

We got the identity and temporary credentials, now we need to attach a role to the IdentityPool which user can assume from their temporary credentials.

## IAM ROLE
Add following after IdentityPool creation:
```typescript
    // Creating role
    const identityPoolAuthRole = new iam.Role(this, 'RandomQuoteIdentityPoolAuthRole', {
      assumedBy: new iam.FederatedPrincipal('cognito-identity.amazonaws.com', {
        'ForAnyValue:StringLike': {
          'cognito-identity.amazonaws.com:amr': 'authenticated'
        }
      }, 'sts:AssumeRoleWithWebIdentity')
    });

    // Granting permissions
    identityPoolAuthRole.addToPolicy(new iam.PolicyStatement()
      .addResource('*')
      .addAction('execute-api:Invoke')
      .allow()
    );
```
Okay let's break down this scary looking code:  
What is `FederatedPrincipal`?  
`Principal` in terms of IAM is an entity that is allowed or denied access to a resources. This can be a user, service, other AWS account etc.  
`FederatedPrincipal` is basically a user with federated identity, or fancy temporary credentials we discussed in beginning of this section. There can be several types of Federated Principals or Users:
- Cognito - `cognito-identity.amazonaws.com`
- Facebook - `graph.facebook.com`  

For more details please check [this](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_principal.html)  
Okay, so when creating FederatedPrincipal object we are saying that:
- It is of type Cognito federated user.
- Who satisfies the condition of being `authenticated`
- Can perform `Action` `sts:AssumeRoleWithWebIdentity`. This action will basically give access to an STS Token.

In second section of code we are simply creating a policy which grants `Invoke` access to all API Gateway endpoints in our account and attaching this policy to our role.

`cdk diff && cdk deploy`  
In order to see what this did open IAM in AWS console and fine the role starting with `CdkWorkshopStack-RandomQuoteIdentityPoolAuthRole`. For first section of code check `Trust relationships` tab. For second section of code check `Permissions` tab.

![](https://media.giphy.com/media/fL1j6YgKVaYmY/giphy.gif)  
<sup>https://media.giphy.com/media/fL1j6YgKVaYmY/giphy.gif</sup>

Okay we got Pool, Identity, Role and Permissions. Only thing missing is provide IdentityPool with the Role so that it can provide credentials to assume that role.

## Attaching Role to IdentityPool
In order to attach Role to IdentityPool we have to use `CfnIdentityPoolRoleAttachment` construct.
```typescript
    new cognito.CfnIdentityPoolRoleAttachment(this, 'RoleAttachments', {
      identityPoolId: identityPool.identityPoolId,
      roles: {
        authenticated: identityPoolAuthRole.roleArn
      }
    });
```
Easy enough, only thing to notice is that we are attaching a role for `authenticated` user. We can attach role for `unauthenticated` users but since we disabled unauthenticated access anyway, we don't need to.

## Congratulations 🍾

![](https://media.giphy.com/media/8JW82ndaYfmNoYAekM/giphy.gif)  
<sup>https://media.giphy.com/media/8JW82ndaYfmNoYAekM/giphy.gif</sup>


Wait WHAT??? How about testing? How do I know this thing even works???

Well sadly I couldn't find a way to test this from CLI so you have to go to next section to see it in action. :)

## [<<PREVIOUS](api_gateway_creation.md)
## [NEXT>>](frontend.md)

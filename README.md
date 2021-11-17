# Donations App

This project was bootstrapped with [Create Serverless Stack](https://docs.serverless-stack.com/packages/create-serverless-stack) using `yarn` as the package manager and `typescript` as the language.

There are two entities in the application, both of which are stored in a single DynamoDB table.
1. Donation
   
   A donation consists of three attributes:
   - Transaction Id: The unique identifier for the donation.
   - Amount: The amount of the donation in cents.
   - Email: This is the email of the user that made the donation.

2. User
   
   A user consists of three attributes:
   - Email: The unique identifier, username alias for the user.
   - Amount: The total amount of all the donations the user has made in cents
   - Donations: The donation that the user made.

# Flow

The entry point to the application is making a donation. A donation is created by making a `POST` request to `/donations` path, providing `email` and `amount` keys in JSON object in the request body. The proxy handler will insert a new item into DynamoDB table, and return `transactionId` field to the client in a JSON object.

There is no direct way to create a user, i.e., there is no endpoint, neither public, nor private, that handles the creation of a user.
The user is created when a donation is made. There are multiple AWS resources that operates for creation of the user.

Following the insertion of a new donation item into the DynamoDB table, a DynamoDB stream will be pulled out by a lambda. The lambda that handles DynamoDB streams is responsible for forwarding the records in the streams into EventBridge by using `PutEvents` command.

A separate EventBridge Bus is created to be associated with the application, and archieving is enabled for replaying events. There is a single event pattern matching rule for the bus that targets a standard SQS queue for further processing.

The SQS handler lambda function is the actual responsible for the creation of a user. The handler creates a new user if it is the first time that he/she made a donation, otheriwse it increments the value for the `amount` attribute by the `amount` of the relevant donation.

In its simplest form, this is the flow that the application is supposed to follow:

1. New Donation is Made by hitting API Gateway route
2. A donation item is iserted into DDB
3. DDB streams arrive at lambda
4. Lambda transforms streams into events and puts into the bus
5. The bus targets the SQS Queue
6. The SQS Queue targets lambda
7. lambda (finally) creates the user if he/she doesn't exists, otherwise updates

# DynamoDB Design
There is a single Global Secondary Index for which the primary key is the reverse of the main table.
## Table and Indexes

| Index      | Partition Key | Sort Key |
| ---------- | ------------- | -------- |
| Main Table | PK            | SK       |
| GSI1       | SK            | PK       |


## Entity Chart

| Entity   | PK                    | SK            | amount     |
| -------- | --------------------- | ------------- | ---------- |
| Donation | DON#< transactionId > | USR#< email > | < amount > |
| User     | USR#< email >         | PROFILE       | < amount > |

## Access Patterns
| Access Pattern                 | Index      | Conditions                           |
| ------------------------------ | ---------- | ------------------------------------ |
| Get Donation by Transaction ID | Main Table | PK = DON#< transactionId >           |
| Get Donations by User Email    | GSI1       | SK = USR< email >                    |
| Get User by Email              | Main Table | PK = USR#< userId > AND SK = PROFILE |


# Routes
The handler for each route is as follows:

[Creating Donation](src/handlers/apiGateway/createDonation/index.ts) `POST /donations`

[Get Donation by its transaction id](src/handlers/apiGateway/getDonation/index.ts) `GET /donations/:transactionId`

[Get donations by user](src/handlers/apiGateway/getDonationsByUser/index.ts) `GET /user/donations/:email`

[Get user profile](src/handlers/apiGateway/getUser/index.ts) `GET /user/:email`

# EventBridge
The source code for the lambda function that receives DynamoDB stream records, transforms into events and puts into the bus is [here](src/handlers/dynamoDB/eventBridge-fanout/index.ts)

The maximum number of entries, as well as the maximum bytes that can be put into the bus in a single `PutEvents` command is taken into consideration, and the lambda function tries to send in batches of 10 entries, and 256 KB at max.

# SQS
The source code for the lambda function that receives SQS records, and creates/updates user items can be found [here](src/handlers/sqs/upsertUser/index.ts)

# Folder Structure
All of the source code is in `src` directory. It contains two main sub directories:
1. [handlers](src/handlers)
   
   All of the handlers are grouped by the event target. There are currently three event targets for the handler:
   - [API Gateway](src/handlers/apiGateway)
   - [DynamoDB Streams](src/handlers/dynamoDB)
   - [SQS](src/handlers/sqs)
2. [lib](src/lib)
   
   This folder is almost a mirrow of the `src/handlers` directory and contains helpers, middlewares, and definitions.
   - API Gateway
     - [Common middleware for api gateway handlers](src/lib/apiGateway/middyfy.ts)
     - [Custom middy middleware for validating the input using **zod**](src/lib/apiGateway/inputValidator.ts)
   - [Read-Write Operations, and handing prefixes for DynamoDB](src/lib/dynamoDB)
   - EventBridge
     - [For calculating the total bytes of a single event](src/lib/eventBridge/calculateEntrySizeFor.ts)
     - [For creating an entry from a single DynamoDB stream record](src/lib/eventBridge/createEntryFrom.ts)
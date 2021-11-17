import * as sst from '@serverless-stack/resources'
import * as ddb from '@aws-cdk/aws-dynamodb'

const handlerDir = 'src/handlers'
export class MainStack extends sst.Stack {
      constructor(scope: sst.App, id: string, props?: sst.StackProps) {
            super(scope, id, props)

            ///////////////////////////////////////////////////////////
            // The DynamoDB table to hold user (donor) and donation information
            // with a single Global Secondary Index
            ///////////////////////////////////////////////////////////
            const table = new sst.Table(this, 'Donations',
                  {
                        fields:
                        {
                              pk: sst.TableFieldType.STRING,
                              sk: sst.TableFieldType.STRING,
                        },
                        primaryIndex:
                        {
                              partitionKey: 'pk',
                              sortKey: 'sk'
                        },
                        globalIndexes:
                        {
                              /** The GSI to enable querying all donations */
                              GSI1:
                              {
                                    partitionKey: 'sk',
                                    sortKey: 'pk',
                                    indexProps: { projectionType: ddb.ProjectionType.ALL }
                              }
                        },
                        stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES,
                        /** The Lambda function that consumes the DynamoDB streams and puts them into EventBridge */
                        consumers:
                        {
                              streamToEb: {
                                    handler: handlerDir + '/dynamoDB/eventBridge-fanout/index.main',
                                    description: 'Forwards DynamoDB streams to EventBridge',
                              }
                        }
                  }
            )

            ///////////////////////////////////////////////////////////
            // The EventBus to receieve DDB Streams through Lambda and targets SQS Queue
            ///////////////////////////////////////////////////////////
            const queue = new sst.Queue(this, 'DonationsQueue', {
                  consumer: {
                        function: {
                              handler: handlerDir + '/sqs/upsertUser/index.main',
                              description: 'Creates a new user iff it does not exist, otherwise modifies user',
                              permissions: [table, 'grantWriteData'],
                              functionName: 'upsertUser',
                              environment: {
                                    tableName: table.tableName
                              }
                        },
                  },
                  sqsQueue:
                  {
                        queueName: 'donationsQueue'
                  }
            })

            ///////////////////////////////////////////////////////////
            // The EventBus to receieve DDB Streams through Lambda and targets SQS Queue
            ///////////////////////////////////////////////////////////
            const eventBus = new sst.EventBus(this, 'DonationsBus', {
                  rules: {
                        newDonation: {
                              description: 'Matches donation creation events',
                              ruleName: 'newDonation',
                              targets: [queue],
                              eventPattern: {
                                    account: [this.account],
                                    detail: ['INSERT DONATION'],
                                    source: [`dynamodb.${table.tableName}`],
                                    resources: [table.tableArn]
                              }
                        }
                  }
            })

            ///////////////////////////////////////////////////////////
            // API Gateway (V2)
            ///////////////////////////////////////////////////////////
            const api = new sst.Api(this, 'Api', {
                  defaultFunctionProps: {
                        environment: {
                              tableName: table.tableName
                        }
                  },
                  routes: {
                        /** API route to create a new donation */
                        'POST      /donations': {
                              handler: handlerDir + '/apiGateway/createDonation/index.main',
                              description: 'Inserts a new donation item into DDB',
                              functionName: 'createDonation',
                              permissions: [table, 'grantWriteData']
                        },
                        /** API route to get a donation by transaction id */
                        'GET      /donations/{transactionId}': {
                              handler: handlerDir + '/apiGateway/getDonation/index.main',
                              description: 'Gets a single donation item by its transactionId',
                              functionName: 'getDonation',
                              permissions: [table, 'grantReadData']
                        },
                        /** API route to get the user profile by email */
                        'GET       /user/{email}': {
                              handler: handlerDir + '/apiGateway/getUser/index.main',
                              description: 'Gets the user profile by its email',
                              functionName: 'getUser',
                              permissions: [table, 'grantReadData']
                        },
                        /** API route to get all donations made by particular user */
                        'GET       /user/donations/{email}': {
                              handler: handlerDir + '/apiGateway/getDonationsByUser/index.main',
                              description: 'Gets all of the donations made by a particular user by his/her email',
                              functionName: 'getDonationsByUser',
                              permissions: [table, 'grantReadData']
                        }
                  },
            })

            ///////////////////////////////////////////////////////////
            // Grant permissions and add environment variables only after Constructs are ready
            ///////////////////////////////////////////////////////////
            table.attachPermissionsToConsumer('streamToEb', [
                  // @ts-expect-error =(
                  [eventBus.eventBridgeEventBus, 'grantPutEventsTo']
            ])
            table.getFunction('streamToEb')?.addEnvironment('eventBusName', eventBus.eventBusName)
            table.getFunction('streamToEb')?.addEnvironment('tableName', table.tableName)

            ///////////////////////////////////////////////////////////
            // Stack Outputs
            ///////////////////////////////////////////////////////////
            this.addOutputs({
                  ApiEndpoint: {
                        value: api.url,
                        description: 'The API Gateway Base URL'
                  },
                  DynamoDBTableName: {
                        value: table.tableName,
                        description: 'The name of the DynamoDB Table for storing Donation and User information'
                  },
                  DynamoDBTableArn: {
                        value: table.tableArn,
                        description: 'The ARN of the DynamoDB table for storing Donation and User information'
                  },
                  EventBusName: {
                        value: eventBus.eventBusName,
                        description: 'The name of the event that receives DDB streams through lambda and targets SQS Queue'
                  },
                  QueueName: {
                        value: queue.sqsQueue.queueName,
                        description: 'The name of the queue that receives EventBridge events'
                  }
            })
      }
}

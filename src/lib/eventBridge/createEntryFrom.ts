import { unmarshall } from '@aws-sdk/util-dynamodb'
import type { DynamoDBRecord } from 'aws-lambda'
import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge'

const eventBusName = process.env.eventBusName || 'default'

/**
 * @description Creates an entry to use in `PutEEventsCommand` from a single record that is received through DynamoDB streams
 * 
 * @param record DynamoDB record
 * @returns {PutEventsRequestEntry}
 */
export function createEntryFrom(record: DynamoDBRecord): PutEventsRequestEntry {
      const { dynamodb, awsRegion, eventSourceARN, eventID } = record
      // @ts-expect-error
      const keys = unmarshall(dynamodb!.Keys!)
      // @ts-expect-error
      const newImage = unmarshall(dynamodb?.NewImage) // Since it is an INSERT, there will be no OLD_IMAGE
      const [prefix, tableName, _stream, _streamTimestamp] = record.eventSourceARN!.split('/')
      /** Convert the epoch timestamp to ms */
      const approximateCreationDateTime = new Date(dynamodb!.ApproximateCreationDateTime! * 1000)
      const tableArn = prefix + '/' + tableName

      const entry: PutEventsRequestEntry = {
            EventBusName: eventBusName,
            Time: approximateCreationDateTime,
            Source: 'dynamodb.' + tableName,
            Resources: [tableArn],
            DetailType: 'INSERT DONATION',
            Detail: JSON.stringify({
                  eventID,
                  awsRegion,
                  keys,
                  newImage,
                  approximateCreationDateTime,
                  dynamodbStreamSequenceNumber: dynamodb!.SequenceNumber,
                  dynamodbStreamArn: eventSourceARN,

            })
      }
      return entry
}
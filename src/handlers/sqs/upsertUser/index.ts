import type { SQSHandler, EventBridgeEvent } from 'aws-lambda'
import type { UpdateItemCommandOutput } from '@aws-sdk/client-dynamodb'

import { logger } from '../../../lib/logger'
import { upsertUser } from '../../../lib/dynamoDB/upsertUser'
import { handlePrefixUSR } from 'lib/dynamoDB/handlePrefix'


type EventDetail = {
      eventID: string
      awsRegion: string //TODO: better to represent it as enum
      keys: {
            sk: string
            pk: string
      },
      newImage: {
            amount: number
            sk: string
            pk: string
      },
      approximateCreationDateTime: string
      dynamodbStreamSequenceNumber: string
      dynamodbStreamArn: string
}
type EventDetailType = 'INSERT DONATION'

export const main: SQSHandler = async (evt, ctx, cb) => {

      const upsertUserPromises = evt.Records.map(record => {
            const recordBody = JSON.parse(record.body) as EventBridgeEvent<EventDetailType, EventDetail>
            const { detail: { newImage } } = recordBody
            const {
                  sk, /** `USR#<email>` */
                  amount
            } = newImage
            const email = handlePrefixUSR.removePrefixFrom(sk)
            return upsertUser(email, amount)
      })

      try {
            const upsertUserOutputs = await Promise.allSettled(upsertUserPromises)

            const successfulExecutions: PromiseSettledResult<UpdateItemCommandOutput>[] = []
            const failedExecutions: PromiseRejectedResult[] = []

            upsertUserOutputs.forEach(upsertUserOutput => {
                  if (upsertUserOutput.status === 'fulfilled') successfulExecutions.push(upsertUserOutput)
                  else failedExecutions.push(upsertUserOutput)
            })

            // Do something with results
            logger.info(`${successfulExecutions.length} number of records are successfully processed`)
            if (failedExecutions.length) {
                  logger.error(`${failedExecutions.length} number of records are failed to process`)
                  logger.error(failedExecutions)
            }
      } catch (error) {
            logger.error(error)
      }

}


import { PutEventsCommand } from '@aws-sdk/client-eventbridge'
import type { PutEventsCommandInput, PutEventsCommandOutput, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge'
import type { DynamoDBStreamHandler } from 'aws-lambda'

import { calculateEntrySizeFor } from '../../../lib/eventBridge/calculateEntrySizeFor'
import { createEntryFrom } from '../../../lib/eventBridge/createEntryFrom'
import { eventBridgeClient } from '../../../lib/eventBridge/eventBridgeClient';
import { logger } from '../../../lib/logger'


const maxBatchSize = 10,
      maxBatchSizeInKb = 256,
      maxBatchSizeInBytes = maxBatchSizeInKb * 1024;

type Batch = {
      entries: PutEventsRequestEntry[]
      totalEntryNum: number
      totalEntryBytes: number
}

export const main: DynamoDBStreamHandler = async (evt, ctx) => {
      /** Instead of mapping records to entries, and then separating them into batches, we do this in one iteration */
      const batches = evt.Records.reduce<Batch[]>((batches, record) => {
            /** We only care about the creation of Donation items, since we did not implement update, i.e. `MODIFY` */
            if (record.eventName === 'INSERT') {
                  const entry = createEntryFrom(record)
                  const entrySize = calculateEntrySizeFor(entry)

                  const lastBatch = batches[batches.length - 1],
                        { totalEntryBytes, totalEntryNum } = lastBatch

                  const shouldGoIntoCurrentBatch =
                        (totalEntryNum + 1 <= maxBatchSize)
                        &&
                        entrySize + totalEntryBytes <= maxBatchSizeInBytes

                  if (shouldGoIntoCurrentBatch) {
                        lastBatch.entries.push(entry)
                        lastBatch.totalEntryNum += 1
                        lastBatch.totalEntryBytes += entrySize
                  } else {
                        /** Create a new batch */
                        batches.push({
                              entries: [entry],
                              totalEntryNum: 1,
                              totalEntryBytes: entrySize
                        })
                  }
            }

            return batches
            /** Initial empty entry so we don't need to check when we destructure `totalEntryBytes` and `totalEntryNum` above */
      }, [{ entries: [], totalEntryNum: 0, totalEntryBytes: 0 }])

      /**
       * It's possible that there was no `INSERT` operation,
       * in that case we won't have any batches or entries to send to EventBridge,
       * Hence we return early if the first batch has no entry at all
       */
      const firstBatch = batches[0]
      if (!firstBatch.totalEntryNum) {
            console.log('There is no INSERT operation, returning early with nothing to put into EventBus.')
            return
      }

      // TODO: Might be better if we map the batches into actual PutEventsCommand above as well
      const batchPromises = batches.map(batch => {
            const { entries } = batch
            const commandInput: PutEventsCommandInput = {
                  Entries: entries
            }
            const command = new PutEventsCommand(commandInput)
            return eventBridgeClient.send(command)
      })
      try {
            const commandOutputs = await Promise.allSettled(batchPromises)

            const successfulExecutions: PromiseSettledResult<PutEventsCommandOutput>[] = []
            const failedExecutions: PromiseRejectedResult[] = []

            commandOutputs.forEach(commandOutput => {
                  if (commandOutput.status === 'fulfilled') successfulExecutions.push(commandOutput)
                  else failedExecutions.push(commandOutput)
            })
            logger.info(`${successfulExecutions.length} number of entries are successfully put into the EventBus`)
            logger.error(`${failedExecutions.length} number of entries are failed to put into the EventBus`)
            // Do something with `successfulExecutions` and `failedExecutions`
      } catch (error) {
            logger.error(error)
      }

}

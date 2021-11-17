import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge'

/**
 * 
 * @param str The string to find the total bytes
 * 
 * @returns {number} Number of bytes for the utf-8 encoded form
 */
function numBytesFrom(str: string): number {
      return Buffer.from(str, 'utf-8').length
}

/**
 * @description Calculates the total number of bytes for a single EventBridge Event Entry based on
 * https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-putevent-size.html
 * 
 * Time, Source, DetailType, Detail, and Resources fields are used to calculate the entry size,
 * 
 * @param entry The entry to be used in`PutEventsCommandInput`
 * 
 * @returns {number} Total number of bytes of the entry
 */
export function calculateEntrySizeFor(entry: PutEventsRequestEntry): number {
      const { Time: time, Source: source, DetailType: detailType, Detail: detail, Resources: resources } = entry

      let size = time ? 14 : 0
      if (source) size += numBytesFrom(source)
      if (detailType) size += numBytesFrom(detailType)
      if (detail) size += numBytesFrom(detail)
      if (resources)
            for (const resource of resources) {
                  size += numBytesFrom(resource)
            }

      return size
}
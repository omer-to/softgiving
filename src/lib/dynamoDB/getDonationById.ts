import { GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb'

import { ddbClient, tableName } from './ddbClient'

/**
 * @description Gets a single donation item, internally uses @see GetItemCommand
 * 
 * @param transactionId The unique identifier for the donation
 */
export function getDonationById(transactionId: string) {
      const commandInput: GetItemCommandInput = {
            TableName: tableName,
            Key: {
                  pk: {
                        S: `DON#${transactionId}`
                  }
            }
      }
      const command = new GetItemCommand(commandInput)
      return ddbClient.send(command)
}
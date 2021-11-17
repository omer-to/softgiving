import { PutItemCommand, PutItemCommandInput } from '@aws-sdk/client-dynamodb'

import { ddbClient, tableName } from './ddbClient'

/**
 * @description Creates a new donation, internally uses @see PutItemCommand
 * 
 * @param transactionId The unique identifier for the donation
 * @param
 * @param amount The amount of the donation in cents
 */
export function createDonation(transactionId: string, email: string, amount: number) {
      const commandInput: PutItemCommandInput = {
            TableName: tableName,
            Item: {
                  pk: {
                        S: `DON#${transactionId}`
                  },
                  sk: {
                        S: `USR#${email}`
                  },
                  amount: {
                        N: amount.toString()
                  }
            }
      }
      const command = new PutItemCommand(commandInput)
      return ddbClient.send(command)
}
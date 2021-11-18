import { QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb'

import { ddbClient, tableName } from './ddbClient'
import { handlePrefixDON } from './handlePrefix'

/**
 * @description Gets a single donation item, internally uses @see GetItemCommand
 * 
 * @param transactionId The unique identifier for the donation
 */
export function getDonationById(transactionId: string) {

      const commandInput: QueryCommandInput = {
            TableName: tableName,
            KeyConditionExpression: '#pk = :pk',
            ExpressionAttributeNames: {
                  '#pk': 'pk'
            },
            ExpressionAttributeValues: {
                  ':pk': {
                        S: handlePrefixDON.addPrefixTo(transactionId)
                  }
            }
      }
      const command = new QueryCommand(commandInput)
      return ddbClient.send(command)
}
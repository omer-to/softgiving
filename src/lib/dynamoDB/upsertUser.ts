import { UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import type { UpdateItemCommandInput } from '@aws-sdk/client-dynamodb'

import { ddbClient, tableName } from './ddbClient';

/**
 * @description Creates a new user if it is the first time he/she makes a donation, otherwise updates the `amount` field, internally uses @see UpdateItemCommand
 * 
 * @param email The email of the user, unique identifier among all other users
 * @param number The amount of the new donation in cents
 */
export function upsertUser(email: string, amount: number) {
      const commandInput: UpdateItemCommandInput = {
            TableName: tableName,
            Key: {
                  pk: {
                        S: `USR#${email}`
                  },
                  sk: {
                        S: 'PROFILE'
                  }
            },
            ExpressionAttributeNames: {
                  '#amount': 'amount'
            },
            ExpressionAttributeValues: {
                  ':amount': {
                        N: amount.toString()
                  }
            },
            UpdateExpression: 'ADD #amount :amount'

      }
      const command = new UpdateItemCommand(commandInput)
      return ddbClient.send(command)
}
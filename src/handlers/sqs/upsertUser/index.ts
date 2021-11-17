import { SQSHandler } from 'aws-lambda'
import { UpdateItemCommand, UpdateItemCommandInput } from '@aws-sdk/client-dynamodb'

import { ddbClient, tableName } from '../../../lib/dynamoDB/ddbClient'

/**
 * @description Creates a new user if it is the first time he/she makes a donation, otherwise updates the `amount` field, internally uses @see UpdateItemCommand
 * 
 * @param email The email of the user, unique identifier among all other users
 * @param number The amount of the new donation in cents
 */
function upsertUser(email: string, amount: number) {
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
            UpdateExpression: `ADD pk ${amount}`

      }
      const command = new UpdateItemCommand(commandInput)
      return ddbClient.send(command)
}


export const main: SQSHandler = async (evt, ctx, cb) => {
      // await upsertUser(email, amount)
}

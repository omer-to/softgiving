import { GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb'

import { ddbClient, tableName } from './ddbClient'
import { handlePrefixUSR } from './handlePrefix'

/**
 * @description Gets the user profile item, internally uses @see GetItemCommand
 * 
 * @param email The email of the user, unique identifier among all other users
 */
export function getUserProfile(email: string) {
      const commandInput: GetItemCommandInput = {
            TableName: tableName,
            Key: {
                  pk: {
                        S: handlePrefixUSR.addPrefixTo(email)
                  },
                  sk: {
                        S: 'PROFILE'
                  }
            }
      }
      const command = new GetItemCommand(commandInput)
      return ddbClient.send(command)
}

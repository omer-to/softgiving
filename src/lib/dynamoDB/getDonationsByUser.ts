import { QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb'
import { ddbClient, tableName } from './ddbClient'
import { handlePrefixUSR } from './handlePrefix'

const gsi1 = 'GSI1'

/**
 * @description Gets all the donation items made by a particular user, internally uses @see QueryCommand
 * 
 * @param email The email of the user, unique identifier among all other users
 */
export function getDonationsByUser(email: string) {

      const commandInput: QueryCommandInput = {
            TableName: tableName,
            IndexName: gsi1,
            KeyConditionExpression: '#sk = :email',
            ExpressionAttributeNames: {
                  '#sk': 'sk'
            },
            ExpressionAttributeValues: {
                  ':email': {
                        S: handlePrefixUSR.addPrefixTo(email)
                  }
            }
      }
      const command = new QueryCommand(commandInput)
      return ddbClient.send(command)
}

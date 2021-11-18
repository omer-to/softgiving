import { unmarshall } from '@aws-sdk/util-dynamodb'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { handlePrefixDON } from 'lib/dynamoDB/handlePrefix'
import { middyfy } from '../../../lib/apiGateway/middyfy'

import { getDonationsByUser } from '../../../lib/dynamoDB/getDonationsByUser'

type PathParameters = {
      email: string
}

// @ts-expect-error
export const handler: APIGatewayProxyHandlerV2 = async (evt) => {

      const { email } = evt.pathParameters as PathParameters
      try {
            const output = await getDonationsByUser(email)
            const donations = output.Items?.map(item => {
                  const { pk, amount } = unmarshall(item)
                  return {
                        transactionId: handlePrefixDON.removePrefixFrom(pk),
                        amount
                  }
            })

            return {
                  statusCode: 200,
                  body: { donations }
            }

      } catch (error) {
            console.error('error ocured')
            console.error({ error })
      }
}

export const main = middyfy(handler, { useHttpJsonBodyParser: false })
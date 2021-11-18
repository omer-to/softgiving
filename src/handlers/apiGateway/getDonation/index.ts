import { unmarshall } from '@aws-sdk/util-dynamodb'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'

import { middyfy } from '../../../lib/apiGateway/middyfy'
import { getDonationById } from '../../../lib/dynamoDB/getDonationById'

type PathParameters = {
      transactionId: string
}

// @ts-expect-error
export const handler: APIGatewayProxyHandlerV2 = async (evt) => {
      const { transactionId } = evt.pathParameters as PathParameters
      console.log('RUNINININININININNI')
      try {
            const donation = await getDonationById(transactionId)
            if (donation.Items) {
                  const item = donation.Items[0] /**it will always return one item at most */
                  return {
                        statusCode: 200,
                        body: unmarshall(item)
                  }

            }

            return { statusCode: 404, body: `Donation ${transactionId} does not exist` }
      } catch (error) {
            console.error('errror ocured')
            console.error({ error })
      }

}

export const main = middyfy(handler, { useHttpJsonBodyParser: false })
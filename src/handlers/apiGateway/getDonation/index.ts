import { APIGatewayProxyHandlerV2 } from 'aws-lambda'

import { middyfy } from '../../../lib/apiGateway/middyfy'
import { getDonationById } from '../../../lib/dynamoDB/getDonationById'

type PathParameters = {
      transactionId: string
}

// @ts-expect-error
export const handler: APIGatewayProxyHandlerV2 = async (evt) => {
      const { transactionId } = evt.pathParameters as PathParameters
      const donation = await getDonationById(transactionId)

      if (donation.Item) return (
            { statusCode: 200, body: donation.Item }
      )
      return { statusCode: 404, body: `Donation ${transactionId} does not exist` }
}

export const main = middyfy(handler, { useHttpJsonBodyParser: false })
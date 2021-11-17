import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { getDonationById } from '../../../lib/dynamoDB/getDonationById'

type PathParameters = {
      transactionId: string
}

export const main: APIGatewayProxyHandlerV2 = async (evt) => {
      const { transactionId } = evt.pathParameters as PathParameters
      const donation = await getDonationById(transactionId)

      if (donation.Item) return (
            { statusCode: 200, body: JSON.stringify(donation.Item) }
      )
      return { statusCode: 404, body: `Donation ${transactionId} does not exist` }
}
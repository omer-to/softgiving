import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { middyfy } from '../../../lib/apiGateway/middyfy'

import { getDonationsByUser } from '../../../lib/dynamoDB/getDonationsByUser'

type PathParameters = {
      email: string
}

export const handler: APIGatewayProxyHandlerV2 = async (evt) => {
      const { email } = evt.pathParameters as PathParameters
      return { body: 'donationsByUser' }
}

export const main = middyfy(handler, { useHttpJsonBodyParser: false })
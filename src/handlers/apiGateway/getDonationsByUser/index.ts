import { APIGatewayProxyHandlerV2 } from 'aws-lambda'

import { getDonationsByUser } from '../../../lib/dynamoDB/getDonationsByUser'

type PathParameters = {
      email: string
}

export const main: APIGatewayProxyHandlerV2 = async (evt) => {
      const { email } = evt.pathParameters as PathParameters
      return { body: 'donationsByUser' }
}
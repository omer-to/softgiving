import { APIGatewayProxyHandlerV2 } from 'aws-lambda'

import { getUserProfile } from '../../../lib/dynamoDB/getUserProfile'

type PathParameters = {
      email: string
}

export const main: APIGatewayProxyHandlerV2 = async (evt) => {
      const { email } = evt.pathParameters as PathParameters
      const userProfile = await getUserProfile(email)

      if (userProfile.Item) return { statusCode: 200, body: JSON.stringify(userProfile.Item) }
      else return { statusCode: 404, body: `No user with ${email} exists` }
}
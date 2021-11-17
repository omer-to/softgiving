import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { middyfy } from '../../../lib/apiGateway/middyfy'

import { getUserProfile } from '../../../lib/dynamoDB/getUserProfile'

type PathParameters = {
      email: string
}

// @ts-expect-error
export const handler: APIGatewayProxyHandlerV2 = async (evt) => {
      const { email } = evt.pathParameters as PathParameters
      const userProfile = await getUserProfile(email)

      if (userProfile.Item) return { statusCode: 200, body: userProfile.Item }
      else return { statusCode: 404, body: `No user with ${email} exists` }
}

export const main = middyfy(handler, { useHttpJsonBodyParser: false })
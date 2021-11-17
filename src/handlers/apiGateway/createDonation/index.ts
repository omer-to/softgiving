import { v4 as uuid } from 'uuid'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'

import { createDonation } from '../../../lib/dynamoDB/createDonation'
import { middyfy } from '../../../lib/apiGateway/middyfy'

type RequestBody = {
      /** The email of the donor, the unique identifier among all users */
      email: string
      /** The donation amount in cents */
      amount: number
}

// @ts-expect-error
const handler: APIGatewayProxyHandlerV2 = async (evt) => {
      const { email, amount } = evt.body as unknown as RequestBody
      const transactionId = uuid()

      await createDonation(transactionId, email, amount)

      return {
            statusCode: 201,
            body: { transactionId }
      }
}

export const main = middyfy(handler, { useHttpEventNormalizer: false })
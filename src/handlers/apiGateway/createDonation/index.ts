import { v4 as uuid } from 'uuid'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'

import { createDonation } from '../../../lib/dynamoDB/createDonation'

type RequestBody = {
      /** The email of the donor, the unique identifier among all users */
      email: string
      /** The donation amount in cents */
      amount: number
}

export const main: APIGatewayProxyHandlerV2 = async (evt) => {
      evt.body = evt.body || '{}'

      const { email, amount } = JSON.parse(evt.body) as RequestBody
      const transactionId = uuid()
      const result = await createDonation(transactionId, email, amount)

      const responseBody = result

      return {
            statusCode: 201,
            body: JSON.stringify({ responseBody, transactionId })
      }
}
import { v4 as uuid } from 'uuid'
import { StatusCodes } from 'http-status-codes'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'

import { RequestBody, requestBodySchema } from './schema'
import { createDonation } from '../../../lib/dynamoDB/createDonation'
import { middyfy } from '../../../lib/apiGateway/middyfy'

// @ts-expect-error
const handler: APIGatewayProxyHandlerV2 = async (evt) => {
      const { email, amount } = evt.body as unknown as RequestBody
      const transactionId = uuid()

      await createDonation(transactionId, email, amount)

      return {
            statusCode: StatusCodes.CREATED,
            body: { transactionId }
      }
}

export const main = middyfy(
      handler,
      {
            useHttpEventNormalizer: false,
            validatorOptions: { schema: requestBodySchema, dataKey: 'body' }
      }
)
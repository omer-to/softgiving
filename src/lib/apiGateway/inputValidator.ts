import middy from '@middy/core'
import { ZodType } from 'zod'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { StatusCodes } from 'http-status-codes'


export type ValidatorOptions = {
      schema: ZodType<unknown, any, unknown>
      dataKey: 'queryStringParameters' | 'body'
}
/**
 * 
 * Validates either `event.body` or `event.queryStringParameters` for the provided zod schema
 * returns early if there are any validation errors.
 * TODO: Allow passing both queryStringParameters and body
 */
export function inputValidator({ schema, dataKey }: ValidatorOptions): middy.MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyResultV2> {
      const beforeInputValidator: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = (request) => {
            const dataToValidate = request.event[dataKey]
            const validation = schema.safeParse(dataToValidate)

            if (!validation.success) {
                  const error = validation.error.flatten().fieldErrors
                  return {
                        statusCode: StatusCodes.BAD_REQUEST,
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify(error)
                  }
            }
      }
      return {
            before: beforeInputValidator
      }
}

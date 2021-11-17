import middy from '@middy/core'
import middyHttpEventNormalizer from '@middy/http-event-normalizer'
import middyHttpJsonBodyParser from '@middy/http-json-body-parser'
import middyHttpResponseSerializer from '@middy/http-response-serializer'
import middyHttpSecurityHeaders from '@middy/http-security-headers'
import middyHttpErrorHandler from '@middy/http-error-handler'
import { inputValidator, ValidatorOptions } from './inputValidator'

import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'


type Options = {
      /** @default true */
      useHttpEventNormalizer?: boolean
      /** @default true */
      useHttpJsonBodyParser?: boolean
      /** @default true */
      useHttpResponseSerializer?: boolean
      /** @default undefined */
      validatorOptions?: ValidatorOptions

}
const defaultOptions: Options = {
      useHttpEventNormalizer: true,
      useHttpJsonBodyParser: true,
      useHttpResponseSerializer: true,
}

export const middyfy = (handler: APIGatewayProxyHandlerV2, options?: Options) => {
      options = { ...defaultOptions, ...options }
      const { useHttpEventNormalizer, useHttpJsonBodyParser, validatorOptions, useHttpResponseSerializer } = options
      const middlewares: middy.MiddlewareObj[] = []

      useHttpEventNormalizer && middlewares.push(middyHttpEventNormalizer({ payloadFormatVersion: 2 }))
      useHttpJsonBodyParser && middlewares.push(middyHttpJsonBodyParser())
      validatorOptions && middlewares.push(inputValidator({ schema: validatorOptions.schema, dataKey: validatorOptions.dataKey }))
      middlewares.push(middyHttpErrorHandler())
      useHttpResponseSerializer && middlewares.push(middyHttpResponseSerializer({
            serializers: [
                  {
                        regex: /^application\/json$/,
                        serializer: ({ body }) => JSON.stringify(body)
                  },

            ],
            default: 'application/json'
      }))
      middlewares.push(middyHttpSecurityHeaders())

      return middy(handler).use(middlewares)
}
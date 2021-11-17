import { z } from "zod";

export const requestBodySchema = z.object({
      /** The email of the donor, the unique identifier among all users */
      email: z.string({
            required_error: 'Email field is required',
            invalid_type_error: 'Email is invalid'
      }).email(),
      /** The donation amount in cents */
      amount: z.number({
            required_error: 'Amount is required to make a donation',
            invalid_type_error: 'Amount must be type number'
      }).min(0.5, 'The donation amount must be more than 0.5 cents')
})

export type RequestBody = z.infer<typeof requestBodySchema>
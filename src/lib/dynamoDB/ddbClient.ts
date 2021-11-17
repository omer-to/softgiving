import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const tableName = process.env.tableName
export const ddbClient = new DynamoDBClient({})
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { logger } from "../logger";

export const tableName = process.env.tableName
export const ddbClient = new DynamoDBClient({ logger })
import { EventBridgeClient } from '@aws-sdk/client-eventbridge'
import { logger } from "../logger";

export const eventBridgeClient = new EventBridgeClient({ logger })
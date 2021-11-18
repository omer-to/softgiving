export declare global {
      namespace NodeJS {
            interface ProcessEnv {
                  tableName: string
                  eventBusName: string
            }
      }
}
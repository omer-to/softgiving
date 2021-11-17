import { RemovalPolicy } from "@aws-cdk/core";
import * as sst from "@serverless-stack/resources";
import { MainStack } from "./MainStack";

export default function main(app: sst.App): void {
      if (app.stage.includes('dev') || app.stage.includes('test')) {
            app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY)
      }

      app.setDefaultFunctionProps({
            runtime: "nodejs14.x"
      });

      new MainStack(app, "main");
}

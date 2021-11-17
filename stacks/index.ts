import * as sst from "@serverless-stack/resources";
import { MainStack } from "./MainStack";

export default function main(app: sst.App): void {
      // Set default runtime for all functions
      app.setDefaultFunctionProps({
            runtime: "nodejs14.x"
      });

      new MainStack(app, "main-stack");

      // Add more stacks
}

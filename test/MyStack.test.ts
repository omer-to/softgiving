import { expect, haveResource } from "@aws-cdk/assert";
import * as sst from "@serverless-stack/resources";
import { MainStack } from "../stacks/MainStack";

test("Test Stack", () => {
      const app = new sst.App();
      // WHEN
      const stack = new MainStack(app, "main-stack");
      // THEN
      expect(stack).to(haveResource("AWS::Lambda::Function"));
});

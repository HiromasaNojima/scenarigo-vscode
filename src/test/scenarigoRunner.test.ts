import * as assert from "assert";
import { ScenarigoRunner, messageSetConfigPath } from "../scenarigoRunner";

suite("Scenarigo Runner Tests", () => {
  test("Should append error message to output panel when selectedConfigPath is not set", () => {
    const mockContext = {
      globalState: {
        get: function (key: string) {
          return undefined;
        },
        update: function (key: string, value: any) {},
      },
    };
    const scenarigoRunner = new ScenarigoRunner(mockContext as any);
    scenarigoRunner.runScenarigo("path/to/scenario.yaml");
    assert.strictEqual(
      scenarigoRunner.getDisplayedOutput(),
      `<pre>${messageSetConfigPath}</pre>`
    );
  });
});

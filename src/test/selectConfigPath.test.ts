import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { selectConfigPath, ShowQuickPickWrapper } from "./../selectConfigPath";

suite("Select Config Path Tests", () => {
  test("Should update selectedConfigPath when a configuration file is selected", async () => {
    const context: vscode.ExtensionContext = {
      globalState: {
        update: (key: string, value: any) => {
          assert.strictEqual(key, "selectedConfigPath");
          assert.strictEqual(value, "path/to/config.yaml");
        },
      } as vscode.Memento,
    } as vscode.ExtensionContext;
    const instance = new ShowQuickPickWrapper();
    const showQuickPickStub = sinon
      .stub(instance, "showQuickPick")
      .resolves("path/to/config.yaml");
    const showInformationMessageStub = sinon.stub(
      vscode.window,
      "showInformationMessage"
    );
    const getStub = sinon
      .stub()
      .withArgs("scenarigo.configPaths")
      .returns(["path/to/config.yaml"]);
    const getConfigurationStub = sinon
      .stub(vscode.workspace, "getConfiguration")
      .returns({
        ...vscode.workspace.getConfiguration(),
        get: getStub,
      });
    await selectConfigPath(context, instance);
    assert.strictEqual(
      showInformationMessageStub.getCall(0).args[0],
      "Scenarigo: config path set to: path/to/config.yaml"
    );
    showQuickPickStub.restore();
    showInformationMessageStub.restore();
    getConfigurationStub.restore();
  });

  test("Should show information message when no configuration paths are defined", async () => {
    const context: vscode.ExtensionContext = {} as vscode.ExtensionContext;
    const getStub = sinon.stub().withArgs("scenarigo.configPaths").returns([]);
    const getConfigurationStub = sinon
      .stub(vscode.workspace, "getConfiguration")
      .returns({
        ...vscode.workspace.getConfiguration(),
        get: getStub,
      });

    const showInformationMessageStub = sinon.stub(
      vscode.window,
      "showInformationMessage"
    );

    await selectConfigPath(context);
    assert.strictEqual(
      showInformationMessageStub.getCall(0).args[0],
      "Scenarigo: No configuration paths are defined."
    );
    showInformationMessageStub.restore();
    getConfigurationStub.restore();
  });
});

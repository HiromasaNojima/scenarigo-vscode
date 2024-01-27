import * as vscode from "vscode";

export function selectConfigPath(context: vscode.ExtensionContext) {
  const configPaths: string[] | undefined = vscode.workspace
    .getConfiguration()
    .get("scenarigo.configPaths");

  if (configPaths && configPaths.length > 0) {
    vscode.window
      .showQuickPick(configPaths, {
        placeHolder: "Select a configuration file to use",
      })
      .then((selectedConfigPath) => {
        if (selectedConfigPath) {
          context.globalState.update("selectedConfigPath", selectedConfigPath);
          vscode.window.showInformationMessage(
            `Scenarigo: config path set to: ${selectedConfigPath}`
          );
        }
      });
  } else {
    vscode.window.showInformationMessage(
      "Scenarigo: No configuration paths are defined."
    );
  }
}

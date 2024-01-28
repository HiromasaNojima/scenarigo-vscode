import * as vscode from "vscode";

/**
 * Prompts the user to select a configuration file path from the available options.
 * If a path is selected, it updates the global state with the selected path and displays an information message.
 * If no configuration paths are defined, it displays a message indicating that no paths are defined.
 *
 * @param context The extension context.
 */
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

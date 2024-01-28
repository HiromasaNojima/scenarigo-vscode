import * as vscode from "vscode";

/**
 * Prompts the user to select a configuration file path from the available options.
 * If a path is selected, it updates the global state with the selected path and displays an information message.
 * If no configuration paths are defined, it displays a message indicating that no paths are defined.
 *
 * @param context The extension context.
 */
export async function selectConfigPath(
  context: vscode.ExtensionContext,
  quickPickWrapper?: ShowQuickPickWrapper
) {
  const configPaths: string[] | undefined = vscode.workspace
    .getConfiguration()
    .get("scenarigo.configPaths");

  const showQuickPick = quickPickWrapper
    ? quickPickWrapper.showQuickPick
    : vscode.window.showQuickPick;
  if (configPaths && configPaths.length > 0) {
    showQuickPick(configPaths, {
      placeHolder: "Select a configuration file to use",
    }).then((selectedConfigPath) => {
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

// wrap for testing
export class ShowQuickPickWrapper {
  showQuickPick(
    items: readonly string[] | Thenable<readonly string[]>,
    options?: vscode.QuickPickOptions,
    token?: vscode.CancellationToken
  ): Thenable<string | undefined> {
    return vscode.window.showQuickPick(items, options, token);
  }
}

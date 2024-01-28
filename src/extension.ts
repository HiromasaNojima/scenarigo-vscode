import * as vscode from "vscode";
import { ScenarigoCodeLensProvider } from "./scenarigoCodeLensProvider";
import { selectConfigPath } from "./selectConfigPath";
import { ScenarigoRunner } from "./scenarigoRunner";

export function activate(context: vscode.ExtensionContext) {
  const runner = new ScenarigoRunner(context);
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "scenarigo-vscode.runScenarigo",
      (filePath) => {
        if (filePath) {
          // run from code lens
          runner.runScenarigo(filePath);
        } else {
          // run from command palette
          const activeEditor = vscode.window.activeTextEditor;
          if (activeEditor && activeEditor.document.languageId === "yaml") {
            runner.runScenarigo(activeEditor.document.uri.fsPath);
          }
        }
      }
    )
  );

  const selectConfigPathCommand = vscode.commands.registerCommand(
    "scenarigo-vscode.selectConfigPath",
    () => selectConfigPath(context)
  );

  const provider = new ScenarigoCodeLensProvider();
  context.subscriptions.push(selectConfigPathCommand);
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ language: "yaml" }, provider)
  );
}

export function deactivate() {}

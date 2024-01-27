import * as vscode from "vscode";

export class ScenarigoCodeLensProvider implements vscode.CodeLensProvider {
  public provideCodeLenses(
    document: vscode.TextDocument
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    const range = new vscode.Range(0, 0, 1, 0); // set the position of the CodeLens
    const command = {
      title: "▶️ Run scenarigo",
      command: "scenarigo-vscode.runScenarigo",
      arguments: [document.uri.fsPath],
    };
    return [new vscode.CodeLens(range, command)];
  }
}

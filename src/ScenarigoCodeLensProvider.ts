import * as vscode from "vscode";

export class ScenarigoCodeLensProvider implements vscode.CodeLensProvider {
  /**
   * A single CodeLens is provided at the top of the document allowing the user to run scenarigo tests.
   *
   * @param document The document for which CodeLenses should be provided.
   * @returns An array of CodeLens objects or a promise that resolves to an array of CodeLens objects.
   */
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

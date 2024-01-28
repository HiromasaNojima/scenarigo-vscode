import * as assert from "assert";
import * as vscode from "vscode";
import { ScenarigoCodeLensProvider } from "../scenarigoCodeLensProvider";

suite("ScenarigoCodeLensProvider Tests", () => {
  test("Should provide a single CodeLens at the top of the document", async () => {
    const document: vscode.TextDocument = {
      uri: vscode.Uri.file("/path/to/document"),
      languageId: "yaml",
      version: 1,
      getText: () => "title: test scenario",
      lineCount: 1,
      lineAt: (line: number) => ({
        lineNumber: line,
        text: "title: test scenario",
        range: new vscode.Range(0, 0, 0, 19),
        rangeIncludingLineBreak: new vscode.Range(0, 0, 0, 19),
        firstNonWhitespaceCharacterIndex: 0,
        isEmptyOrWhitespace: false,
      }),
      offsetAt: (position: vscode.Position) => 0,
      positionAt: (offset: number) => new vscode.Position(0, 0),
      validateRange: (range: vscode.Range) => range,
      validatePosition: (position: vscode.Position) => position,
    } as vscode.TextDocument;

    const codeLenses = await new ScenarigoCodeLensProvider().provideCodeLenses(
      document
    );

    const runScenarigoCodeLens = codeLenses[0];
    if (!runScenarigoCodeLens.command) {
      throw new Error("command is undefined");
    }

    assert.strictEqual(runScenarigoCodeLens.command.title, "▶️ Run scenarigo");
    assert.strictEqual(
      runScenarigoCodeLens.command.command,
      "scenarigo-vscode.runScenarigo"
    );
    assert.deepStrictEqual(runScenarigoCodeLens.command.arguments, [
      "/path/to/document",
    ]);
  });
});

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { spawn } from "child_process";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const runScenarigoCommand = vscode.commands.registerCommand(
    "scenarigo-vscode.runScenarigo",
    (filePath) => {
      if (filePath) {
        // run from code lens
        runScenarigo(context, filePath);
        console.log("Scenarigo command executed");
      } else {
        // run from command palette
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.languageId === "yaml") {
          runScenarigo(context, activeEditor.document.uri.fsPath);
        }
      }
    }
  );

  const selectConfigPathCommand = vscode.commands.registerCommand(
    "scenarigo-vscode.selectConfigPath",
    () => selectConfigPath(context)
  );

  const provider = new ScenarigoCodeLensProvider();
  context.subscriptions.push(runScenarigoCommand);
  context.subscriptions.push(selectConfigPathCommand);
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ language: "yaml" }, provider)
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function runScenarigo(
  context: vscode.ExtensionContext,
  filePath: string
) {
  // コマンドの実行
  const selectedConfigPath =
    context.globalState.get<string>("selectedConfigPath");

  if (!selectedConfigPath) {
    // 設定ファイルがまだ選択されていなければ選択を促す
    selectConfigPath(context);
    return;
  }

  runCommandAndAppendToPanel(filePath, selectedConfigPath);
}

function selectConfigPath(context: vscode.ExtensionContext) {
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
          // グローバルステートに選択した設定ファイルを保存
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

class ScenarigoCodeLensProvider implements vscode.CodeLensProvider {
  public provideCodeLenses(
    document: vscode.TextDocument
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    // ここで、再生ボタンを表示する条件を定義します。
    // 例えば、ファイルの先頭に再生ボタンを表示する場合：
    console.log(document.uri.fsPath);
    console.log(document);
    const range = new vscode.Range(0, 0, 1, 0); // ファイルの先頭
    const command = {
      title: "▶️ Run scenarigo", // ボタンのタイトル
      command: "scenarigo-vscode.runScenarigo", // 実行するコマンド
      arguments: [document.uri.fsPath], // コマンドに渡す引数（ここではファイルパス）
    };
    return [new vscode.CodeLens(range, command)];
  }
}

let outputPanel: vscode.WebviewPanel | undefined;

function createOutputPanel() {
  // 既にパネルが存在する場合はそれを使用
  if (outputPanel) {
    outputPanel.reveal(vscode.ViewColumn.Two);
    return outputPanel;
  }

  // 新しい Webview Panel を作成
  outputPanel = vscode.window.createWebviewPanel(
    "outputPanel", // 識別子
    "Command Output", // パネルのタイトル
    vscode.ViewColumn.Two // パネルを表示するカラム（Two は右側を意味する）
  );

  // パネルが閉じられたときの処理
  outputPanel.onDidDispose(() => {
    outputPanel = undefined;
  }, null);

  return outputPanel;
}

function appendToOutputPanel(message: string) {
  const panel = createOutputPanel();
  const content = `<pre>${message}</pre>`;
  panel.webview.html += content;
}

// この関数をコマンドの実行結果を表示するために使用する
function runCommandAndAppendToPanel(
  filePath: string,
  selectedConfigPath: string
) {
  const child = spawn("scenarigo", ["run", filePath, "-c", selectedConfigPath]);

  child.stdout.on("data", (data) => {
    appendToOutputPanel(data.toString());
  });

  child.stderr.on("data", (data) => {
    appendToOutputPanel(data.toString());
  });

  child.on("close", (code) => {
    appendToOutputPanel(`\nProcess exited with code ${code}`);
  });
}

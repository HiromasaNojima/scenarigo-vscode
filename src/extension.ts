import * as vscode from "vscode";
import { spawn } from "child_process";
import { ScenarigoCodeLensProvider } from "./scenarigoCodeLensProvider";
import { selectConfigPath } from "./selectConfigPath";

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

export function deactivate() {}

async function runScenarigo(
  context: vscode.ExtensionContext,
  filePath: string
) {
  const selectedConfigPath =
    context.globalState.get<string>("selectedConfigPath");

  if (!selectedConfigPath) {
    selectConfigPath(context);
    return;
  }

  runCommandAndAppendToPanel(filePath, selectedConfigPath);
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

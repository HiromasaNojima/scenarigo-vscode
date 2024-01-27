// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from "child_process";


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

function runScenarigo(context: vscode.ExtensionContext, filePath: string) {
  // コマンドの実行
  const selectedConfigPath =
    context.globalState.get<string>("selectedConfigPath");

  if (!selectedConfigPath) {
    // 設定ファイルがまだ選択されていなければ選択を促す
    selectConfigPath(context);
    return;
  }
  
  exec(
    `scenarigo run ${filePath} -c ${selectedConfigPath}`,
    (err, stdout, stderr) => {
      if (err) {
        // 実行時のエラー処理
        console.error(`exec error: ${err}`);
        return;
      }

      // 標準出力と標準エラー出力の表示
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);

      // 成功時の処理（例：VS Codeの通知）
      vscode.window.showInformationMessage("Scenarigo executed successfully!");
    }
  );
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
    vscode.window.showInformationMessage("No configuration paths are defined.");
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
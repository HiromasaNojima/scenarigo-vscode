import * as vscode from "vscode";
import { spawn } from "child_process";

const messageSetConfigPath = `No configuration path is set. \nSet one from the command palette "Scenarigo: Select Config Path".`;

export class ScenarigoRunner {
  private outputPanel: vscode.WebviewPanel | undefined;

  constructor(private context: vscode.ExtensionContext) {}

  public runScenarigo(filePath: string) {
    const selectedConfigPath =
      this.context.globalState.get<string>("selectedConfigPath");
    if (!selectedConfigPath) {
      this.appendToOutputPanel(messageSetConfigPath);
      return;
    }

    this.runCommandAndAppendToPanel(filePath, selectedConfigPath);
  }

  private createOutputPanel() {
    if (this.outputPanel) {
      this.outputPanel.reveal(vscode.ViewColumn.Two);
      return this.outputPanel;
    }

    this.outputPanel = vscode.window.createWebviewPanel(
      "outputPanel", // identifier of the panel
      "Scenarigo", // title displayed in the panel header
      vscode.ViewColumn.Two
    );

    this.outputPanel.onDidDispose(() => {
      this.outputPanel = undefined;
    }, null);

    return this.outputPanel;
  }

  private appendToOutputPanel(message: string) {
    const panel = this.createOutputPanel();
    const content = `<pre>${message}</pre>`;
    panel.webview.html += content;
  }

  private runCommandAndAppendToPanel(
    filePath: string,
    selectedConfigPath: string
  ) {
    const child = spawn("scenarigo", [
      "run",
      filePath,
      "-c",
      selectedConfigPath,
    ]);

    child.stdout.on("data", (data) => {
      this.appendToOutputPanel(data.toString());
    });

    child.stderr.on("data", (data) => {
      this.appendToOutputPanel(data.toString());
    });

    child.on("close", (code) => {
      this.appendToOutputPanel(`\nProcess exited with code ${code}`);
    });
  }
}

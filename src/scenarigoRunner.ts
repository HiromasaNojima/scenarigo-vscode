import * as vscode from "vscode";
import { spawn } from "child_process";

const messageSetConfigPath = `No configuration path is set. \nSet one from the command palette "Scenarigo: Select Config Path".`;

export class ScenarigoRunner {
  private outputPanel: vscode.WebviewPanel | undefined;

  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Runs scenarigo with the specified scenario and config within the global state.
   * @param scenarioPath The path of the scenarigo scenario file to run.
   *
   * `scenarigo run ${scenarioPath} -c  ${selectedConfigPath}`
   */
  public runScenarigo(scenarioPath: string) {
    const selectedConfigPath =
      this.context.globalState.get<string>("selectedConfigPath");
    if (!selectedConfigPath) {
      // show error message to recommend setting a config path
      this.appendToOutputPanel(messageSetConfigPath);
      return;
    }

    this.run(scenarioPath, selectedConfigPath);
  }

  /**
   * Appends a message to the output panel.
   *
   * @param message - The message to be appended.
   */
  private appendToOutputPanel(message: string) {
    const panel = this.getOutputPanel();
    const content = `<pre>${message}</pre>`;
    panel.webview.html += content;
  }

  /**
   * Retrieves the output panel for displaying scenarigo results.
   * If the panel already exists, it will be revealed. Otherwise, a new panel will be created.
   * @returns The output panel.
   */
  private getOutputPanel(): vscode.WebviewPanel {
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

  /**
   * Runs the scenarigo command with the specified scenario and config paths.
   * @param scenarioPath - The path to the scenario file.
   * @param configPath - The path to the config file.
   */
  private run(scenarioPath: string, configPath: string) {
    const child = spawn("scenarigo", ["run", scenarioPath, "-c", configPath]);

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

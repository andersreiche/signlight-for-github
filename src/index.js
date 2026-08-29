import * as core from "@actions/core";
import * as github from "@actions/github";
import {runEvent} from "./runner.js";

async function main() {
  try {
    const token = core.getInput("github-token", {required: true});
    const result = await runEvent({
      eventName: github.context.eventName,
      payload: github.context.payload,
      octokit: github.getOctokit(token),
      inputs: {
        commandPrefix: core.getInput("command-prefix"),
        minimumPermission: core.getInput("minimum-permission"),
        allowedSigners: core.getInput("allowed-signers"),
        statusContext: core.getInput("status-context"),
      },
      logger: core,
    });
    core.setOutput("handled", result.handled);
    if (result.status) {
      core.setOutput("status", result.status.state);
    }
    if (!result.handled) {
      core.info(result.reason);
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

await main();

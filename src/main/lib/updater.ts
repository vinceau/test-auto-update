/**
 * Based off: https://github.com/electron-userland/electron-builder/blob/docs/encapsulated%20manual%20update%20via%20menu.js
 */

import { MenuItem } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import pkg from "../../../package.json";
import diff from "semver/functions/diff";

import { getLatestVersion, needsUpdate } from "common/githubReleaseVersions";

import { isDevelopment } from "common/utils";
import {
  sendDownloadComplete,
  sendNoUpdateAvailable,
  sendUpdateAvailable,
  sendUpdateError,
  sendUpdateMessage,
  sendUpdateProgress,
} from "./updateStatus";

log.transports.file.level = "silly";
log.transports.console.level = "silly";
autoUpdater.logger = log;
// We don't want to auto-download and install since we want control over
// which versions we auto-update to or not
autoUpdater.autoDownload = false;

let updater: MenuItem | null = null;

async function startUpdateCheck(backgroundCheck?: boolean): Promise<void> {
  log.info(`checking for updates ${backgroundCheck ? "in the background" : ""}...`);

  // Only auto updates are supported in Windows
  const autoUpdatesEnabled = process.platform === "win32" && !isDevelopment;

  if (autoUpdatesEnabled) {
    console.log("On windows so using built in auto updater...");
    await autoUpdater.checkForUpdates();
  } else {
    await checkGithubForUpdates();
  }
}

async function checkGithubForUpdates() {
  // We're on Mac or Linux so check Github for latest version
  const latest = await getLatestVersion("vinceau", pkg.name);

  if (needsUpdate(latest)) {
    sendUpdateAvailable(latest);
  } else {
    sendNoUpdateAvailable();
  }
}

/*
    // We need to update
    if (this.autoUpdatesEnabled) {
      // Only auto-download if it's a patch version
      const versionChangeType = diff(pkg.version, latest);
      if (versionChangeType === "patch") {
        // Auto start the download
        await autoUpdater.downloadUpdate();
      }
    } else {
      // It's a Github release so send update
      this._githubUpdateAvailable(latest);
    }
    */

/*
  public onError(err: any, title = "Error: ") {
    log.error(err);
    console.log(title, err);
    // if (this.giveFeedback) {
    //   dialog.showErrorBox(title, err === null ? "unknown" : (err.stack || err).toString());
    // }
  }

  public async noUpdateAvailable() {
    if (!this.giveFeedback) {
      return;
    }

    // await dialog.showMessageBox({
    //   type: "info",
    //   title: "No updates available",
    //   message: "You're already on the latest version!",
    // });
  }

  private _githubUpdateAvailable(version: string) {
    console.log(`showing github update message... ${version}`);
    if (!this.giveFeedback) {
      console.log("jk give feedback is false");
      return;
    }
    console.log("showing github update message...");
    const win = BrowserWindow.getFocusedWindow();
    if (!win) {
      return;
    }

    /*
    dialog
      .showMessageBox(win, {
        type: "info",
        title: "New update available",
        message: `Project Clippi v${version} is available from Github. Open the releases page?`,
        defaultId: 0,
        buttons: ["Open", "Maybe later"],
      })
      .then(({ response }) => {
        if (response === 0) {
          const url = `${pkg.author.url}/${pkg.name}/releases`;
          shell.openExternal(url);
        }
      });
      */

autoUpdater.on("error", (err) => {
  sendUpdateMessage(`error. payload: ${err.message || err}`);
  log.error(err);
  sendUpdateError(err.message || err);
});

autoUpdater.on("update-available", async (info) => {
  sendUpdateMessage(`update-available. payload: ${JSON.stringify(info, null, 2)}`);
  const { version } = info;

  // Only auto-download if it's a patch version
  const versionChangeType = diff(pkg.version, version);
  if (versionChangeType === "patch") {
    // Auto start the download
    await autoUpdater.downloadUpdate();
  } else {
    sendUpdateAvailable(version);
    enableUpdaterMenu();
  }
});

function enableUpdaterMenu() {
  if (updater) {
    updater.label = "Check for updates";
    updater.enabled = true;
    updater = null;
  }
}

autoUpdater.on("update-not-available", () => {
  sendUpdateMessage("update not available");
  sendNoUpdateAvailable();
  enableUpdaterMenu();
});

autoUpdater.on("download-progress", (progressObj) => {
  sendUpdateMessage(`download progress, ${JSON.stringify(progressObj, null, 2)}`);
  console.log(`got a download progress message. payload: ${JSON.stringify(progressObj, null, 2)}`);
  sendUpdateProgress(progressObj);
});

autoUpdater.on("update-downloaded", async (info) => {
  sendUpdateMessage(`update download, ${JSON.stringify(info, null, 2)}`);
  sendDownloadComplete();

  /*
  const { response } = await dialog.showMessageBox({
    type: "info",
    title: "New update available",
    message: `Project Clippi v${info.version} is available. Update and restart now?`,
    buttons: ["Restart now", "Maybe later"],
  });
  if (response === 0) {
    setImmediate(() => autoUpdater.quitAndInstall());
  } else if (updater) {
    updater.enabled = true;
    updater = null;
  }
  */
});

export async function checkForUpdates(giveFeedback?: boolean) {
  console.log(`calling checkForUpdates. giveFeedback?: ${giveFeedback}`);
  try {
    await startUpdateCheck();
  } catch (err) {
    sendUpdateError(err.message);
  }
}

export async function checkForUpdatesFromMenu(menuItem: MenuItem) {
  console.log("calling checkForUpdatesFromMenu");
  updater = menuItem;
  updater.label = "Checking for updates...";
  updater.enabled = false;
  await checkForUpdates();
  enableUpdaterMenu();
}

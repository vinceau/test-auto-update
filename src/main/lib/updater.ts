/**
 * Based off: https://github.com/electron-userland/electron-builder/blob/docs/encapsulated%20manual%20update%20via%20menu.js
 * updater.js
 *
 * Please use manual update only when it is really required, otherwise please use recommended non-intrusive auto update.
 *
 * Import steps:
 * 1. create `updater.js` for the code snippet
 * 2. require `updater.js` for menu implementation, and set `checkForUpdates` callback from `updater` for the click property of `Check Updates...` MenuItem.
 */

import { BrowserWindow, dialog, MenuItem } from "electron";
// import { getStatic } from "./notifications";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

// const iconPath = getStatic("/images/icon@32.png");

let updater: MenuItem | null;
autoUpdater.autoDownload = false;

/*
autoUpdater.on("error", (error) => {
  dialog.showErrorBox("Error: ", error === null ? "unknown" : (error.stack || error).toString());
});

autoUpdater.on("update-available", async () => {
  const { response } = await dialog.showMessageBox({
    icon: nativeImage.createFromPath(iconPath),
    type: "info",
    title: "Found Updates",
    message: "Found updates, do you want update now?",
    buttons: ["Sure", "No"],
  });
  if (response === 0) {
    autoUpdater.downloadUpdate();
  } else if (updater) {
    updater.enabled = true;
    updater = null;
  }
});
*/

autoUpdater.logger = log;

log.info("App starting...");

(autoUpdater.logger as any).transports.file.level = "info";

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Checking for update...");
});
autoUpdater.on("update-available", (info) => {
  console.log(`update info: `, info);
  sendStatusToWindow(`Update available: ${JSON.stringify(info)}`);
  sendMessage("update_available");
});
autoUpdater.on("update-not-available", (info) => {
  console.log(`update not available info: `, info);
  sendStatusToWindow(`Update not available: ${JSON.stringify(info)}`);
});
autoUpdater.on("error", (err) => {
  sendStatusToWindow("Error in auto-updater. " + err);
});
autoUpdater.on("download-progress", (progressObj) => {
  sendStatusToWindow(JSON.stringify(progressObj));
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + " - Downloaded " + progressObj.percent + "%";
  log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")";
  sendStatusToWindow(log_message);
});
autoUpdater.on("update-downloaded", (info) => {
  console.log(`update downloaded info: `, info);
  sendStatusToWindow(`Update downloaded: ${JSON.stringify(info)}`);
  sendMessage("update_downloaded");
});

autoUpdater.on("update-not-available", async () => {
  if (updater) {
    await dialog.showMessageBox({
      // icon: nativeImage.createFromPath(iconPath),
      type: "info",
      title: "No updates available",
      message: "You're already on the latest version!",
    });
    updater.enabled = true;
    updater = null;
  }
});

autoUpdater.on("update-downloaded", async (info: any) => {
  const { response } = await dialog.showMessageBox({
    // icon: nativeImage.createFromPath(iconPath),
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
  // dialog.showMessageBoxSync({
  //   icon: nativeImage.createFromPath(iconPath),
  //   title: "Install Updates",
  //   message: "Updates downloaded, application will be quit for update...",
  // });
  // setImmediate(() => autoUpdater.quitAndInstall());
});

// export this to MenuItem click callback
export function checkForUpdatesFromMenu(menuItem: MenuItem) {
  updater = menuItem;
  updater.enabled = false;
  autoUpdater.checkForUpdates();
}

function sendStatusToWindow(text: string) {
  log.info(text);
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.webContents.send("message", text);
  }
}

function sendMessage(messageName: string) {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.webContents.send(messageName);
  }
}

export function checkForUpdates() {
  autoUpdater.checkForUpdates();
}

export function startDownload() {
  autoUpdater.downloadUpdate();
}

export function installAndRestart() {
  autoUpdater.quitAndInstall();
}

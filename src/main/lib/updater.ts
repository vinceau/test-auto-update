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

// const iconPath = getStatic("/images/icon@32.png");

let updater: MenuItem | null;
// autoUpdater.autoDownload = false;

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
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.setClosable(true);
    }
    setImmediate(() => autoUpdater.quitAndInstall(true));
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
export function checkForUpdates(menuItem: MenuItem) {
  updater = menuItem;
  updater.enabled = false;
  autoUpdater.checkForUpdates();
}

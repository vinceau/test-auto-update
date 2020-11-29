// This is free and unencumbered software released into the public domain.
// See LICENSE for details

import { BrowserWindow } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";

//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
(autoUpdater.logger as any).transports.file.level = "info";
log.info("App starting...");

function sendStatusToWindow(text: string) {
  console.log("sending status to window");
  log.info(text);
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.webContents.send("message", text);
  } else {
    console.log("no window found");
  }
}

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Checking for update...");
});
autoUpdater.on("update-available", (info: any) => {
  sendStatusToWindow(`Update available. Info: ${JSON.stringify(info, null, 2)}`);
});
autoUpdater.on("update-not-available", (info: any) => {
  sendStatusToWindow(`Update not available. ${JSON.stringify(info, null, 2)}`);
});
autoUpdater.on("error", (err) => {
  sendStatusToWindow("Error in auto-updater. " + err);
});

autoUpdater.on("download-progress", (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + " - Downloaded " + progressObj.percent + "%";
  log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")";
  sendStatusToWindow(log_message);
  sendStatusToWindow(`progress object: ${JSON.stringify(progressObj, null, 2)}`);
});

autoUpdater.on("update-downloaded", (info: any) => {
  sendStatusToWindow(`Update downloaded. Info: ${JSON.stringify(info, null, 2)}`);
});

export function checkForUpdates() {
  sendStatusToWindow("checking for updates now....");
  autoUpdater.checkForUpdates();
}

//
// CHOOSE one of the following options for Auto updates
//

//-------------------------------------------------------------------
// Auto updates - Option 1 - Simplest version
//
// This will immediately download an update, then install when the
// app quits.
//-------------------------------------------------------------------
// app.on('ready', function()  {
//   autoUpdater.checkForUpdatesAndNotify();
// });

//-------------------------------------------------------------------
// Auto updates - Option 2 - More control
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------
// app.on('ready', function()  {
//   autoUpdater.checkForUpdates();
// });
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (info) => {
// })
// autoUpdater.on('update-not-available', (info) => {
// })
// autoUpdater.on('error', (err) => {
// })
// autoUpdater.on('download-progress', (progressObj) => {
// })
// autoUpdater.on('update-downloaded', (info) => {
//   autoUpdater.quitAndInstall();
// })

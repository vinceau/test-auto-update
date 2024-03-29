import { App, BrowserWindow, ipcMain } from "electron";

import { autoUpdater } from "electron-updater";

import { IPC } from "common/ipc";

export const reset = "\x1b[0m";
export const dim = "\x1b[2m";
export const highlight = "\x1b[36m";

export const setupIPC = (app: App, window: BrowserWindow): IPC => {
  // ipc communication
  ipcMain.on("quit", () => {
    app.quit();
  });

  ipcMain.on("restart_app", () => {
    autoUpdater.quitAndInstall();
  });

  return new IPC(ipcMain, () => window.webContents);
};

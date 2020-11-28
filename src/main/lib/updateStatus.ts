import { BrowserWindow } from "electron";
import { Message, UpdateStatus } from "common/types";

function sendVersionUpdateStatus(status: UpdateStatus, payload?: any) {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.webContents.send(Message.VersionUpdateStatus, {
      status,
      payload,
    });
  }
}

export function sendNoUpdateAvailable() {
  sendVersionUpdateStatus(UpdateStatus.NO_UPDATE);
}

export function sendUpdateAvailable(version: string) {
  sendVersionUpdateStatus(UpdateStatus.UPDATE_AVAILABLE, version);
}

export function sendUpdateProgress(payload: any) {
  sendVersionUpdateStatus(UpdateStatus.DOWNLOAD_PROGRESS, payload);
}

export function sendDownloadComplete() {
  sendVersionUpdateStatus(UpdateStatus.DOWNLOAD_COMPLETE);
}

export function sendUpdateError(message: string) {
  sendVersionUpdateStatus(UpdateStatus.UPDATE_ERROR, message);
}

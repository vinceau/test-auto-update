import * as path from "path";

import { app, BrowserWindow, Menu, shell, Event } from "electron";
import { format as formatUrl } from "url";
import { setupListeners } from "./listeners";
import { setupIPC } from "./mainIpc";

import { lightTheme } from "../common/theme";
import { isDevelopment } from "../common/utils";
import contextMenu from "electron-context-menu";
import { getMenuTemplate } from "./menu";
import { getCurrentTheme } from "./lib/toggleTheme";

import log from "electron-log";
import { checkForUpdates } from "./lib/updater";
// import { autoUpdater } from "electron-updater";

// autoUpdater.logger = log;

// log.info("App starting...");

// (autoUpdater.logger as any).transports.file.level = "info";

// autoUpdater.on("checking-for-update", () => {
//   sendStatusToWindow("Checking for update...");
// });
// autoUpdater.on("update-available", (info) => {
//   console.log(`update info: `, info);
//   sendStatusToWindow(`Update available: ${JSON.stringify(info)}`);
//   mainWindow!.webContents.send("update_available");
// });
// autoUpdater.on("update-not-available", (info) => {
//   console.log(`update not available info: `, info);
//   sendStatusToWindow(`Update not available: ${JSON.stringify(info)}`);
// });
// autoUpdater.on("error", (err) => {
//   sendStatusToWindow("Error in auto-updater. " + err);
// });
// autoUpdater.on("download-progress", (progressObj) => {
//   sendStatusToWindow(JSON.stringify(progressObj));
//   let log_message = "Download speed: " + progressObj.bytesPerSecond;
//   log_message = log_message + " - Downloaded " + progressObj.percent + "%";
//   log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")";
//   sendStatusToWindow(log_message);
// });
// autoUpdater.on("update-downloaded", (info) => {
//   console.log(`update downloaded info: `, info);
//   sendStatusToWindow(`Update downloaded: ${JSON.stringify(info)}`);
//   mainWindow!.webContents.send("update_downloaded");
// });

contextMenu();

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null;

function sendStatusToWindow(text: string) {
  log.info(text);
  mainWindow!.webContents.send("message", text);
}

function createMainWindow() {
  const window = new BrowserWindow({
    backgroundColor: lightTheme.background,
    webPreferences: {
      nodeIntegration: true, // <--- flag
      nodeIntegrationInWorker: true, // <---  for web workers
    },
    autoHideMenuBar: true,
  });
  // window.removeMenu();

  // A bit of a hack to allow the renderer window to synchronously get the current theme
  // without waiting for an IPC message
  (window as any).getCurrentTheme = getCurrentTheme;

  window.webContents.on("did-frame-finish-load", () => {
    if (isDevelopment) {
      window.webContents.openDevTools();
      window.webContents.on("devtools-opened", () => {
        window.focus();
      });
    }
  });

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
      })
    );
  }

  window.on("closed", () => {
    mainWindow = null;
  });

  const ipc = setupIPC(app, window);
  setupListeners(ipc);

  return window;
}

// quit application when all windows are closed
app.on("window-all-closed", () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

const startUp = async () => {
  // Create the Application's main menu
  const template = getMenuTemplate(app, process.platform);
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  // Set any anchor links to open in default web browser
  mainWindow = createMainWindow();
  mainWindow.webContents.on("new-window", (event: Event, url: string) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Check for updates on first boot but don't notify
  sendStatusToWindow("checking for updates...");
  await checkForUpdates();
  sendStatusToWindow("finished checking for updates!");
};

if (isDevelopment) {
  // There's an issue with Windows 10 dark mode where the ready event doesn't fire
  // when running in dev mode. Use the prepend listener to work around this.
  // See https://github.com/electron/electron/issues/19468#issuecomment-623529556 for more info.
  app.prependOnceListener("ready", startUp);
} else {
  // Otherwise create main BrowserWindow when electron is ready normally
  app.on("ready", startUp);
}

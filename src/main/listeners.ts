import { IPC } from "common/ipc";
import { Message } from "common/types";

import { openFileSystemDialog } from "./lib/fileSystem";
import { showNotification } from "./lib/notifications";
import { toggleTheme } from "./lib/toggleTheme";

export const setupListeners = (ipc: IPC): void => {
  ipc.on(Message.AuthenticateTwitch, async (_, _error?: Error) => {
    if (_error) {
      throw new Error("Should not have received error");
    }

    try {
      return null;
    } catch (err) {
      console.error(err);
      showNotification("Error authenticating with Twitch");
      return null;
    }
  });

  ipc.on(Message.CreateTwitchClip, async (_, _error?: Error) => {
    if (_error) {
      throw new Error("Should not have received error");
    }

    return null;
  });

  ipc.on(Message.SignOutTwitch, async (_, _error?: Error) => {
    if (_error) {
      throw new Error("Should not have received error");
    }

    return null;
  });

  ipc.on(Message.SelectDirectory, async (value, _error?: Error) => {
    if (_error) {
      throw new Error("Should not have received error");
    }

    const { options, save } = value;

    return await openFileSystemDialog(options, save);
  });

  ipc.on(Message.Notify, (value, _error?: Error) => {
    if (_error) {
      throw new Error("Should not have received error");
    }

    const { title, message } = value;
    showNotification(message, title);
  });

  ipc.on(Message.ToggleTheme, (value, _error?: Error) => {
    if (_error) {
      throw new Error("Should not have received error");
    }

    const { theme } = value;
    toggleTheme(theme);
  });
};

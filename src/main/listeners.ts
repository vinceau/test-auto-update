import { IPC } from "common/ipc";
import { Message } from "common/types";

import { showNotification } from "./lib/notifications";
import { toggleTheme } from "./lib/toggleTheme";

export const setupListeners = (ipc: IPC): void => {
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

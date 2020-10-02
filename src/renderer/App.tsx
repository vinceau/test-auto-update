import React from "react";

import pkg from "../../package.json";
import { ipcRenderer } from "electron";

export const App: React.FC = () => {
  const [messages, setMessages] = React.useState<string[]>([]);
  const [notif, setNotif] = React.useState<string>("");
  const [showNotif, setShowNotif] = React.useState<boolean>(false);
  const [showRestart, setShowRestart] = React.useState<boolean>(false);
  const closeNotification = () => setShowNotif(false);
  const restartApp = () => {
    ipcRenderer.send("restart_app");
  };

  React.useEffect(() => {
    ipcRenderer.on("message", (_, text) => {
      const x = JSON.stringify(text);
      setMessages([...messages, x]);
    });
    ipcRenderer.once("update_available", () => {
      setNotif("A new update is available. Downloading now...");
      setShowNotif(true);
    });
    ipcRenderer.once("update_downloaded", () => {
      setNotif("Update Downloaded. It will be installed on restart. Restart now?");
      setShowRestart(true);
      setShowNotif(true);
    });
  });
  return (
    <div>
      <h1>Hello!!</h1>
      <div id="notification" className={showNotif ? "" : "hidden"}>
        <p id="message">{notif}</p>
        <button id="close-button" onClick={closeNotification}>
          Close
        </button>
        <button id="restart-button" onClick={restartApp} className={showRestart ? "" : "hidden"}>
          Restart
        </button>
      </div>
      <h2>{pkg.version}</h2>
      <h2>Messages</h2>
      <div style={{ wordBreak: "break-all" }}>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </div>
    </div>
  );
};

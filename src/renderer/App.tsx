import React from "react";

import { remote, ipcRenderer } from "electron";

const version = remote.app.getVersion();

export const App: React.FC = () => {
  const [messages, setMessages] = React.useState<string[]>([]);
  React.useEffect(() => {
    ipcRenderer.on("message", (_, text) => {
      const x = JSON.stringify(text);
      setMessages([...messages, x]);
    });
  });
  return (
    <div>
      <h1>{version}</h1>
      <h2>Messages</h2>
      <div>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </div>
    </div>
  );
};

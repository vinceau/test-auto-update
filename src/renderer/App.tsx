import React from "react";

import pkg from "../../package.json";
import { ipcRenderer } from "electron";

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
      <h1>Hello world</h1>
      <h2>{pkg.version}</h2>
      <h2>Messages</h2>
      <div>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </div>
    </div>
  );
};

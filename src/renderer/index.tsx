import "./styles.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./App";

const rootEl = document.getElementById("app");

const render = (Component: any) =>
  // eslint-disable-next-line react/no-render-return-value
  ReactDOM.render(<Component />, rootEl);

render(App);

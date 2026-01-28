import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App/App";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { Mode } from "../utility/common.enum";

/* global document, Office, module, require, HTMLElement */

const title = "Contoso Task Pane Add-in";

const rootElement: HTMLElement | null = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

/* Render application after Office initializes */
Office.onReady(() => {
  //

  const isRead = !!Office.context.mailbox.item.itemId;

  if (isRead) {
    console.log("READ MODE INITIALIZED");
  } else {
    console.log("COMPOSE MODE INITIALIZED");
  }

  const mode = isRead ? Mode.ReadMode : Mode.ComposeMode;
  //

  root?.render(
    <FluentProvider theme={webLightTheme}>
      <App title={title} mode={mode} />
    </FluentProvider>
  );
});

if ((module as any).hot) {
  (module as any).hot.accept("./components/App/App", () => {
    const NextApp = require("./components/App/App").default;
    root?.render(NextApp);
  });
}

Office.onReady().then(() => {
  // In read mode the item has an itemId; in compose it does not
  const isRead = !!Office.context.mailbox.item.itemId;

  if (isRead) {
    // READ-MODE: use read APIs (getAsync, display fields, etc.)
    const subject = Office.context.mailbox.item.subject || "";
    // example: read-only display
    // document.getElementById("modeLabel").innerText = "Read mode";
    // document.getElementById("subject").innerText = subject;
    console.log("READ MODE INITIALIZED");
    // ...additional read-only logic...
  } else {
    // COMPOSE-MODE: use compose APIs (setAsync allowed)
    // document.getElementById("modeLabel").innerText = "Compose mode";
    console.log("COMPOSE MODE INITIALIZED");
    // ...compose logic...
  }
});

import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import App from "./components/App/App";
import { Mode } from "../utility/enums/common.enum";
import { AppProvider } from "../utility/store/AppContext";
import "./index.css";

/* global document, Office, module, require */

const TITLE = "Outplay";

const container = document.getElementById("container") as HTMLElement | null;
const root: Root | null = container ? createRoot(container) : null;

/**
 * Detect Outlook item mode
 */
const getOutlookMode = (): Mode => {
  const isReadMode = !!Office.context.mailbox.item?.itemId;
  return isReadMode ? Mode.ReadMode : Mode.ComposeMode;
};

/**
 * Render React application
 */
const renderApp = (AppComponent: React.FC<any>) => {
  if (!root) return;

  const mode = getOutlookMode();

  console.log(mode === Mode.ReadMode ? "READ MODE INITIALIZED" : "COMPOSE MODE INITIALIZED");

  root.render(
    <FluentProvider theme={webLightTheme}>
      <AppProvider value={{ mode }}>
        <AppComponent />
      </AppProvider>
    </FluentProvider>
  );
};

/**
 * Office initialization
 */
Office.onReady(() => {
  renderApp(App);
});

/**
 * Hot Module Replacement (Development only)
 */
if ((module as any).hot) {
  (module as any).hot.accept("./components/App/App", () => {
    const NextApp = require("./components/App/App").default;
    renderApp(NextApp);
  });
}

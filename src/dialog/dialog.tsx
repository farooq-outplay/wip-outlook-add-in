/// <reference types="office-js" />
import React from "react";
import { createRoot } from "react-dom/client";
import Dialog from "./components/Dialog";
import AddTaskModal from "./components/AddTaskModal";

Office.onReady(() => {
  const container = document.getElementById("dialog-root")!;
  const root = createRoot(container);

  // Simple routing based on query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const dialogType = urlParams.get("dialog");

  if (dialogType === "addTask") {
    root.render(<AddTaskModal />);
  } else {
    // Default to existing dialog (Add to Sequence)
    root.render(<Dialog />);
  }
});

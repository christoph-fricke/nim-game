import { StrictMode } from "react";
import { render } from "react-dom";
import { App } from "./app";
import { InspectorToggle, showInspector } from "./inspector/inspector";

(async function main() {
  await showInspector();

  const root = document.querySelector("#root");
  render(
    <StrictMode>
      <App />
      <InspectorToggle />
    </StrictMode>,
    root
  );
})();

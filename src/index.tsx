import { StrictMode } from "react";
import { render } from "react-dom";
import { Game } from "./game";
import { InspectorToggle, showInspector } from "./inspector/inspector";

(async function main() {
  await showInspector();

  const root = document.querySelector("#root");
  render(
    <StrictMode>
      <Game />
      <InspectorToggle />
    </StrictMode>,
    root
  );
})();

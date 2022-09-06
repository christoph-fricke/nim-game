import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Game } from "./game";
import { InspectorToggle, showInspector } from "./inspector/inspector";

(async function main() {
  await showInspector();

  const root = createRoot(document.querySelector("#root")!);
  root.render(
    <StrictMode>
      <Game />
      <InspectorToggle />
    </StrictMode>
  );
})();

import { useState } from "react";
import * as styles from "./inspector.module.css";

const storageKey = "nim-inspect";

/**
 * Call this function before the app is rendered to open the Stately inspector
 * if requested by the user.
 */
export async function showInspector() {
  if (!sessionStorage?.getItem(storageKey)) return;

  const { inspect } = await import("@xstate/inspect");

  inspect({ iframe: false, url: "https://stately.ai/viz?inspect" });
}

/** Little debug button placed in the bottom right to toggle the Stately inspector in PROD. */
export function InspectorToggle() {
  const [isVisible] = useState(() =>
    Boolean(sessionStorage?.getItem(storageKey) ?? false)
  );

  function handleToggle() {
    if (isVisible) {
      sessionStorage?.removeItem(storageKey);
      // Reload the page to unmount the inspector.
      document.location.reload();
      return;
    }

    sessionStorage?.setItem(storageKey, "true");
    // Reload the page to mount the inspector.
    document.location.reload();
  }

  return (
    <button className={styles.inspectorToggle} onClick={handleToggle}>
      {isVisible ? "Hide Inspector" : "Show Inspector"}
    </button>
  );
}

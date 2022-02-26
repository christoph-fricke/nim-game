import { render } from "react-dom";
import { App } from "./app";

(async function main() {
	if (process.env.NODE_ENV === "development") {
		const { inspect } = await import("@xstate/inspect");

		inspect({ iframe: false, url: "https://stately.ai/viz?inspect" });
	}

	const root = document.querySelector("#root");
	render(<App />, root);
})();

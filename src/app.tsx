import { useState } from "react";
import * as styles from "./app.module.css";

export function App() {
	const [count, setCount] = useState(0);

	const inc = () => setCount((c) => c + 1);
	const dec = () => setCount((c) => c - 1);

	return (
		<>
			<h1 className={styles.heading}>Hello from React</h1>
			<p>Current Count: {count}</p>
			<button className={styles.button} onClick={inc}>
				Increment
			</button>
			<button className={styles.button} onClick={dec}>
				Decrement
			</button>
		</>
	);
}

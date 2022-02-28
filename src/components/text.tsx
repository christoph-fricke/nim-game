import type { HTMLAttributes } from "react";
import { cx } from "./utils";
import * as styles from "./text.module.css";

interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "p" | "h2";
  tone?: "positive" | "negative" | "neutral";
  size?: "large";
}

export function Text(props: TextProps): JSX.Element {
  switch (props.as) {
    case "p":
      return (
        <p
          {...props}
          data-tone={props.tone ?? "neutral"}
          data-size={props.size}
          className={cx(styles.text, props.className)}
        >
          {props.children}
        </p>
      );
    case "h2":
      return (
        <h2
          {...props}
          data-tone={props.tone ?? "neutral"}
          className={cx(styles.text, props.className)}
        >
          {props.children}
        </h2>
      );
    default:
      return (
        <span
          {...props}
          data-tone={props.tone ?? "neutral"}
          data-size={props.size}
          className={cx(styles.text, props.className)}
        >
          {props.children}
        </span>
      );
  }
}

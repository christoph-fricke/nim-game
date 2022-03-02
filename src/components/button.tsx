import type { HTMLAttributes } from "react";
import * as styles from "./button.module.css";
import { cx } from "./utils";

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      data-variant={props.variant}
      className={cx(styles.button, props.className)}
    >
      {props.children}
    </button>
  );
}

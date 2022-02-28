import type { HTMLAttributes } from "react";
import { cx } from "./utils";
import * as styles from "./button.module.css";

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
}

export function Button(props: ButtonProps) {
  return (
    <button {...props} className={cx(styles.button, props.className)}>
      {props.children}
    </button>
  );
}

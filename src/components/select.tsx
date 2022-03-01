import type { OptionHTMLAttributes, SelectHTMLAttributes } from "react";
import * as styles from "./select.module.css";
import { cx } from "./utils";

export function Select(
  props: SelectHTMLAttributes<HTMLSelectElement> & { id: string; label: string }
): JSX.Element {
  return (
    <div className={styles.selectGroup}>
      <label className={styles.label} htmlFor={props.id}>
        {props.label}
      </label>
      <select
        {...props}
        id={props.id}
        className={cx(styles.select, props.className)}
      >
        {props.children}
      </select>
    </div>
  );
}

export function Option(
  props: OptionHTMLAttributes<HTMLOptionElement>
): JSX.Element {
  return <option {...props}>{props.children}</option>;
}

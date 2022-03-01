import type { OptionHTMLAttributes, SelectHTMLAttributes } from "react";
import * as styles from "./select.module.css";
import { cx } from "./utils";

export function Select(
  props: SelectHTMLAttributes<HTMLSelectElement> & { id: string; label: string }
): JSX.Element {
  const { label, ...rest } = props;

  return (
    <div className={styles.selectGroup}>
      <label className={styles.label} htmlFor={rest.id}>
        {label}
      </label>
      <select
        {...rest}
        id={rest.id}
        className={cx(styles.select, rest.className)}
      >
        {rest.children}
      </select>
    </div>
  );
}

export function Option(
  props: OptionHTMLAttributes<HTMLOptionElement>
): JSX.Element {
  return <option {...props}>{props.children}</option>;
}

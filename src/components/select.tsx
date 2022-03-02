import type { OptionHTMLAttributes, SelectHTMLAttributes } from "react";
import * as styles from "./select.module.css";
import { cx } from "./utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
}

export function Select(props: SelectProps): JSX.Element {
  const { id, label, ...rest } = props;

  return (
    <div className={styles.selectGroup}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <select {...rest} id={id} className={cx(styles.select, rest.className)}>
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

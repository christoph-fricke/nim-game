import type { Match as MatchState } from "../nim";
import * as styles from "./match-pile.module.css";

interface MatchProps {
  state: MatchState | "selected";
  disabled?: boolean;
  onToggle(): void;
}

export function Match(props: MatchProps): JSX.Element {
  return (
    <button
      data-state={props.state}
      disabled={props.disabled}
      onClick={props.onToggle}
      className={styles.match}
      aria-label="Match"
    ></button>
  );
}

interface PileProps {
  children: JSX.Element[];
}

export function Pile(props: PileProps): JSX.Element {
  return <section className={styles.pile}>{props.children}</section>;
}

import type { Match as MatchState, Position } from "../nim";
import * as styles from "./match-pile.module.css";

interface MatchProps {
  state: MatchState | "selected";
  position: Position;
  disabled?: boolean;
  onToggle(position: Position): void;
}

export function Match(props: MatchProps): JSX.Element {
  return (
    <button
      role="listitem"
      data-state={props.state}
      disabled={props.disabled}
      onClick={() => props.onToggle(props.position)}
      className={styles.match}
      aria-label={`Match ${props.position + 1}`}
    />
  );
}

interface PileProps {
  children: JSX.Element[];
}

export function Pile(props: PileProps): JSX.Element {
  return (
    <section role="list" className={styles.pile}>
      {props.children}
    </section>
  );
}

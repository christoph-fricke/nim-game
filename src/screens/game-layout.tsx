import * as styles from "./game-layout.module.css";

export interface GameLayoutProps {
  children: JSX.Element | JSX.Element[];
}

/** Provides a Header for all game screens and centers the layout. */
export function GameLayout(props: GameLayoutProps): JSX.Element {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.gameTitle}>Nim - The Game</h1>
        {props.children}
      </div>
    </main>
  );
}

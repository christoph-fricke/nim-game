import type { HumanPlayerActor, HumanPlayerState } from "../human-player";
import { toggleMatch, stopGame, submitMove } from "../human-player";
import { Button } from "../components/button";
import { Text } from "../components/text";
import { Match, Pile } from "../components/match-pile";
import type { Position } from "../nim";
import { useSelector } from "@xstate/react";
import { useMemo } from "react";
import { GameLayout } from "./game-layout";

function selectHumanState(state: HumanPlayerState) {
  return {
    pile: state.context.pile,
    canPlay: !state.hasTag("waiting"),
    canToggle: (i: number) => state.can(toggleMatch(i as Position)),
    canSubmit: state.can(submitMove()),
    matchState: (i: number) =>
      state.context.nextMove.includes(i as Position)
        ? "selected"
        : state.context.pile[i] ?? "free",
  };
}

function useHumanState(human: HumanPlayerActor) {
  const state = useSelector(human, selectHumanState);

  const events = useMemo(
    () => ({
      toggleMatch: (i: number) => human.send(toggleMatch(i as Position)),
      submitMove: () => human.send(submitMove()),
      stopGame: () => human.send(stopGame()),
    }),
    [human]
  );

  return [state, events] as const;
}

export function Playing(props: { human: HumanPlayerActor }) {
  const [state, events] = useHumanState(props.human);

  return (
    <GameLayout>
      {state.canPlay ? (
        <Text size="large">Select up to Three Matches</Text>
      ) : (
        <Text size="large">Waiting for Opponent</Text>
      )}
      <Pile>
        {state.pile.map((_, pos) => {
          return (
            <Match
              key={pos}
              state={state.matchState(pos)}
              onToggle={() => events.toggleMatch(pos)}
              disabled={!state.canToggle(pos)}
            />
          );
        })}
      </Pile>
      <Button onClick={events.submitMove} disabled={!state.canSubmit}>
        Make Move
      </Button>
      <Button variant="secondary" onClick={events.stopGame}>
        Leave
      </Button>
    </GameLayout>
  );
}

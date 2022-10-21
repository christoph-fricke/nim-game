import { createTestMachine } from "@xstate/test";

export function createMainMenuMachine() {
  /** @xstate-layout N4IgpgJg5mDOIC5QFkCGBLAdgAmWTArtgJKYAuYATqgMZnoD2mAdGlrvga5OgQLbYAIugBmI9DQIAbMgE8AxDQAWqTDGxkG2MAA8ylMHzABtAAwBdRKAAODWOnpMrIHYgBMANgCszAIxePAHYADgBOD18PABYoty8vABoQWUQAWnjmQIBmL2DTL1DI0MDfYICAX3Kkthw8QhJyKlpHFhqOQmYAUT0DIyFRcUkZBWVVdU1sIwhePjNLJBBbexbnVwRPH08I6O2YuMTkxALmULcorJyo31MbwNMPSuqMWs4Gimo6Rlbn9oJ5WDIqEoZGwUFQRjmziWDi+q0QvjcgWYWTCbl8viihT28SSKQQvlOyLcwSiwX28TKWUeIDadSIpHezS+zAAClJULIsFB5FIwKgAG5gUHgkwWKF2GFOBZrUlI4JBEmmLKmQLxbJRXHwwlZYmk8m5LxU6mYBgQODOWmvBlNT5MVg-Oncab8fpiCTSOTi5aw6Xw0xuZjBVHozEY2JeNya9bMDw5YkhC7+4Jh6mW+rWj4te3sR3dfSGIXCN1DT0LaErX0Ic5RPy+HJ1skR4JZWNRgOxpsJ5XElNVGkOq2NTPMtNcAAS6ABXslmDhVfCgebUW8ytVXkCGsOCA3zFMoQuGL3ZS8USVqYH6aHTLto+nFdAaxPi9OIax4cjW9SYcyOTyBSKJTyueOaDoytosGyHJcnePoPogyoeDGbgqnWWShKEmLoW2sTMLk-joRcoYeMEwEvJeYH3osEqUWsiFBi+GJvnEbg5FGqQsVkP65PkhQeMUpQPJU5RAA */
  return createTestMachine({
    tsTypes: {} as import("./main-menu-machine.typegen").Typegen0,
    // @ts-expect-error
    predictableActionArguments: true,
    id: "Main Menu Interaction",
    initial: "Main Menu",
    states: {
      "Main Menu": {
        initial: "Medium Difficulty",
        states: {
          "Medium Difficulty": {
            on: {
              "change to extreme": {
                target: "Extreme Difficulty",
              },
            },
          },
          "Extreme Difficulty": {
            on: {
              "change to medium": {
                target: "Medium Difficulty",
              },
            },
          },
          Hist: {
            history: "shallow",
            type: "history",
          },
        },
        on: {
          "start game": {
            target: "Playing",
          },
        },
      },
      Playing: {
        on: {
          "leave game": {
            target: "#Main Menu Interaction.Main Menu.Hist",
          },
        },
      },
    },
  });
}

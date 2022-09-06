import { createTestMachine } from "@xstate/test";

export function createMainMenuMachine() {
  /** @xstate-layout N4IgpgJg5mDOIC5QFkCGBLAdgAmWTArtgJKYAuYATqgMZnoD2mAdGlrvga5OgQLbYAIugBmI9DQIAbMgE8AxDQAWqTDGxkG2MAA8ylMHzCJQABwax09JiZA7EAJgCMABmYBOAKwBmAByvfF08AFgA2AHYndwAaEFlEJwdQ5m8kn3DfDKcnUNDggF982LYcPEIScipaaxYSjkJmAFE9AyMhUXFJGQVlVXVNbCMIXj5bc0sa23sEZydmF1DvHIiXYJd1h1j4hFdmEJzgz19vdeDfPIKikDqyolIKajpGWoxSznlYMlRKMmwoVCMYwsVmeUwS3mSnnCoQc3k8Rxh4XcTm8W0cqWYDgcXnc4W84XCsK8hWKr3qd0qjxqzAAClJULIsFB5FIwKgAG5gP4A4xIEDjEE2PnTYI5ZjBYIOIK5ULuTJrVFxdEOTHYzy4-GE7zEkkgTAMCBwWw3TgVB7VZ6sMm3bjDfjtMQSaRyIETUHCxDubzi3zY0JOYLIiUOTybJUIKEeCJLdwuY4uBz+CW6k3le5VJ5MK3sG3NfSGLnCR1dF18gWTD0IVLhFJIlG+X2h46LNERmvuaOrHLrFzhBYp62m9NUy2prgACXQn1dgswYIQkrmh2hvjWUPh4WCrZRKtlmV9q988IVA5zQ8pFqzY5nFdA01lPr9AaDktDrYAtP7xUdvKKXPjZUTU83jTC9MxYOkGSZG93TvRwvWYeMsSWTJXCiVtExrJwkRDeFV2RUJfGA8kzQzW9+WBciRU8R8O2fANXzDbZ3xRb1DmOBwkSCYJfySQpCiAA */
  return createTestMachine({
    tsTypes: {} as import("./main-menu-machine.typegen").Typegen0,
    // @ts-ignore
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
            type: "history",
            history: "shallow",
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

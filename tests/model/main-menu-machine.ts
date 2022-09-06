import { createTestMachine } from "@xstate/test";

export function createMainMenuMachine() {
  /** @xstate-layout N4IgpgJg5mDOIC5QFkCGBLAdgAmWTArtgJKYAuYATqgMZnoD2mAdGlnoQMSxmqVnYoqALZhEoAA4NY6ek3EgAHogCMAVgDMzAJwAmABwAGQ-t2HdAFhUA2QxYA0IAJ6rt15hePaA7Gu8btQx9vAF8QxzYcDiJSCmo6RhZI6M4aAAtUTBhsMgZsUQh0AmEFKRk5TAVlBBVa5n01FQ1vfT1mxu01RxcEAFobZkaglQt9Cw1GjWttMIiMKPwY8ipaCtZ5lPTM7NzsMEUySjBRUulZRKrVOu8LM0Na7SaG6xVuxF61bWYpjX1vdX0gN0al0ulmIEiuEWJGW8TWAAUADaoJxYKCcRFgVAANzAghEYiQIDK53kROqzWYBkCFgsnxUbQM1jeCF01n03w0I38dMMGg0FmsoXCEPmUMIMLiq0SrEgRWEABF0AAzZXoGgERFkJypDJZPG7faHY6EyRnCqXBC85i+Yx+W5qMb6FkqXTeZi2Wls+7aPSfMEiyHRSUrBJMWWFYpK1XqzXa7i8fj4k5EkkW8mIXTaCwexotSx57T6V7OVzuTxBXz+QLBcFB6GxUNrACiByOomjao1Wp1W31OTyBXlp3KFwzVtGVNubLMjpBApZvS+FkChms3sa9OLdbFwcbcJlreNHZVXbjOp4fAEQhTZtHZNA1X99TUo2a2bZTxdbg8XirAUrYURUwBgIDgBR6wlfdpXDZJFhHUlKnHCYdF9ND0LQ-RmVLBBPg8bw1z0FprC5aw1HIncsHFJYpTDFgkRRNEEPTR9EA0OxmBUOxAlBUw6WsBwcIMDk-n8bxbDtAThTmKi91hGCkjlKNT1jHtmLHVjWXZTjPkdR5HiFWlsJ6PCLAI-5XVGYFXRmQNdwbeS6OYI92zATtVO1dSHyURA1GsdwVF8V12Vqfl-BZUzzKzf57iwww1EohYoMcljiXNDSfJqFRUIw3KsMXJpsp+QENDZcZHVKsIwiAA */
  return createTestMachine({
    tsTypes: {} as import("./main-menu-machine.typegen").Typegen0,
    // @ts-ignore
    predictableActionArguments: true,
    id: "Main Menu Interaction",
    initial: "MainMenu",
    states: {
      MainMenu: {
        on: {
          "start game": {
            target: "Playing",
          },
          "change to medium": {
            target: "MediumDifficulty",
          },
          "change to extreme": {
            target: "ExtremeDifficulty",
          },
        },
      },
      Playing: {
        on: {
          "leave game": {
            target: "MainMenu",
          },
        },
      },
      MediumDifficulty: {
        on: {
          "change to extreme": {
            target: "ExtremeDifficulty",
          },
          "start game": {
            target: "Playing",
          },
        },
      },
      ExtremeDifficulty: {
        on: {
          "change to medium": {
            target: "MediumDifficulty",
          },
          "start game": {
            target: "Playing",
          },
        },
      },
    },
  });
}

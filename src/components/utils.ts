/** Merges multiple classnames together */
export function cx(...args: (string | undefined)[]): string {
  return args
    .reduce<string>((prev, curr) => prev + (curr ? " " + curr : ""), "")
    .trim();
}

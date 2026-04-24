declare module "figlet/importable-fonts/*" {
  const font: string;
  export default font;
}

declare module "figlet" {
  type FontsKnown = string;
  function text(
    txt: string,
    options: { font?: string },
    callback: (err: Error | null, result?: string) => void
  ): void;
  function parseFont(name: string, data: string): void;
  export default { text, parseFont };
  export { text, parseFont, FontsKnown };
}

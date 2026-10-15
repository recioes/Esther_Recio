const ROCKET_ART = String.raw`
      /\
     /  \
    | ER |
    |    |
   /|    |\
  /_|_/\_|_\
     /||\
    / || \
`;

/** Recado para quem abre o console do navegador. */
export function printConsoleSignature(hello: string, cta: string, url: string): void {
  console.info(`%c${ROCKET_ART}`, 'color:#c4b5fd;font-family:monospace;line-height:1.1');
  console.info(`%c${hello}`, 'color:#f9a8d4;font-size:14px;font-weight:700');
  console.info(`%c${cta} ${url}`, 'color:#8b5cf6;font-size:13px');
}

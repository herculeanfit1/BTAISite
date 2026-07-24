/* eslint-disable no-console -- single sanctioned console wrapper for the API
   layer. The SWA managed hybrid backend captures console output, which is the
   interim observability channel (plan Q6) until App Insights preload lands. */

/** Structured logging for the API layer. `info` carries the correlation trace. */
export const apiLog = {
  info(message: string, meta?: unknown): void {
    if (meta === undefined) console.log(message);
    else console.log(message, meta);
  },
  warn(message: string, meta?: unknown): void {
    if (meta === undefined) console.warn(message);
    else console.warn(message, meta);
  },
  error(message: string, meta?: unknown): void {
    if (meta === undefined) console.error(message);
    else console.error(message, meta);
  },
};

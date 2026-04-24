import { ashbyAdapter } from "./ashby";
import { greenhouseAdapter } from "./greenhouse";
import { leverAdapter } from "./lever";
import type { AtsAdapter } from "./types";

export const adapters: AtsAdapter[] = [
  greenhouseAdapter,
  leverAdapter,
  ashbyAdapter,
];

export function getAdapter(name: string): AtsAdapter | undefined {
  return adapters.find((a) => a.name === name);
}

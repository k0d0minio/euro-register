import type { ReactNode } from "react";

export type SlideDef = {
  id: string;
  /** Short title: footer, aria label. */
  title: string;
  content: ReactNode;
};

/// <reference types="vite/client" />

declare module "virtual:problems" {
  export type Problem = {
    id: string;
    title: string;
    statement: string;
    solution: string | null;
  };

  export const problems: Problem[];
}

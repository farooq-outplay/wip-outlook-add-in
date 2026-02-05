export {};

declare global {
  const module: {
    hot?: {
      accept(path: string, callback: () => void): void;
    };
  };
}

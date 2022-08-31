declare const process: {
  env: {
    API_ORIGIN?: string;
  };
};

export const API_ORIGIN =
  process.env.API_ORIGIN === "LOCAL"
    ? "http://localhost:23564"
    : "http://little-water-8645.fly.dev";

declare const process: {
  env: {
    API_ORIGIN?: string;
  };
};

export const API_ORIGIN =
  process.env.API_ORIGIN === "LOCAL"
    ? "http://localhost:23564"
    : "https://serene-reef-96808.herokuapp.com";

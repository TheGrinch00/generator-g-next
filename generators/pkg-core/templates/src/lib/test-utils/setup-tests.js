// Filter noisy console output from deps (dotenv, ts-jest, custom-env)
const SILENCE_PATTERNS = [
    "[dotenv@", // dotenv banners
    "ts-jest[versions]", // ts-jest version checker
    "No env file present for the current environment", // custom-env warning
    "Falling back to .env config", // custom-env info
  ];
  ["log", "warn", "info"].forEach((level) => {
    const orig = console[level].bind(console);
  
    console[level] = (...args) => {
      const first = args[0];
      
      if (typeof first === "string" && SILENCE_PATTERNS.some((p) => first.includes(p))) {
        return;
      }
      
      orig(...args);
    };
  });
  
  require("custom-env").env("test", {
    debug: false,
  });
  
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable the overly-aggressive setState-in-effect rule.
      // Calling setState inside useEffect is a standard React pattern
      // (e.g. form pre-population, auth checks, localStorage reads).
      // React 19 and the official React docs endorse this pattern.
      "react-hooks/set-state-in-effect": "off",

      // Allow <img> tags — we handle lazy loading manually for perf.
      // Next.js <Image /> is not always suitable (e.g. dynamic CDN URLs, canvas renders).
      "@next/next/no-img-element": "off",

      // Allow explicit `any` in API response handlers and legacy data shapes.
      "@typescript-eslint/no-explicit-any": "warn",

      // Allow unused vars that start with underscore (common destructure pattern)
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],

      // Unused eslint-disable directives in some files — just warn
      "no-console": "off",
    },
  },
];

export default eslintConfig;

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const config = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "public/mockServiceWorker.js",
    ],
  },
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "domain", pattern: "src/features/*/domain/**" },
        { type: "application", pattern: "src/features/*/application/**" },
        { type: "infrastructure", pattern: "src/features/*/infrastructure/**" },
        { type: "presentation", pattern: "src/features/*/presentation/**" },
        { type: "shared", pattern: "src/shared/**" },
        { type: "app", pattern: "src/app/**" },
        { type: "mocks", pattern: "src/mocks/**" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: "domain",
              disallow: [
                "application",
                "infrastructure",
                "presentation",
                "app",
                "shared",
                "mocks",
              ],
            },
            {
              from: "application",
              disallow: ["infrastructure", "presentation", "app", "mocks"],
            },
            { from: "infrastructure", disallow: ["presentation", "app"] },
            { from: "presentation", disallow: ["infrastructure"] },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/*/domain/**/*.ts", "src/features/*/domain/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react/*",
                "next",
                "next/*",
                "@tanstack/*",
                "xstate",
                "axios",
                "fetch",
              ],
              message:
                "Domain code must remain framework and transport agnostic.",
            },
          ],
        },
      ],
    },
  },
];

export default config;

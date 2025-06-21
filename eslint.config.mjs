import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import apiGuidelinesPlugin from "./eslint-plugin-api-guidelines/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Custom rule to prevent adding new files under /src/pages/api/ except for process.ts
const restrictApiRoutesRule = {
  create(context) {
    // Get the filename of the current file being linted
    const filename = context.getFilename();

    // Check if the file is under /src/pages/api/ but not process.ts
    if (
      filename.includes('/src/pages/api/') &&
      !filename.endsWith('/src/pages/api/process.ts') &&
      !filename.endsWith('\\src\\pages\\api\\process.ts') // For Windows paths
    ) {
      // Report an error for any file that's not process.ts in the /src/pages/api/ directory
      context.report({
        loc: { line: 1, column: 0 },
        message: 'API routes should not be added directly under /src/pages/api/. Use the centralized API architecture pattern instead.',
      });
    }

    return {};
  }
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: {
      "restrict-api-routes": {
        rules: {
          "no-direct-api-routes": restrictApiRoutesRule
        }
      },
      "api-guidelines": apiGuidelinesPlugin
    },
    rules: {
      "restrict-api-routes/no-direct-api-routes": "error",
      "react-hooks/exhaustive-deps": "off",
      // Add API Guidelines rules
      "api-guidelines/no-server-import-in-client": ["warn", {
        // Import type imports from server are fine
        allowedPaths: [
          '@/server/cache/types'
        ]
      }],
      "api-guidelines/api-names-from-index": ["warn", {
        // Type imports from server are fine
        allowedPaths: [
          '@/server/cache/types'
        ]
      }],
      "api-guidelines/server-reexport-from-index": "warn",
      "api-guidelines/client-returns-cache-result": "warn",
      "api-guidelines/no-duplicate-api-types": "warn",
      "api-guidelines/no-direct-api-client-call": "warn",
      "api-guidelines/export-name-from-index": "warn",
      "api-guidelines/no-export-process-from-index": ["warn", {
        // For actions we need to export these functions
        ignorePatterns: [
          '**/actions/index.ts'
        ]
      }]
    }
  }
];

export default eslintConfig;

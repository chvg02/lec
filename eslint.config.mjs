import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/components/tiptap-templates/**/*.tsx",
      "src/components/tiptap-templates/**/*.ts",
      "src/components/tiptap-ui-primitive/**/*.tsx",
      "src/components/tiptap-ui-primitive/**/*.ts",
      "src/components/tiptap-ui/**/*.tsx",
      "src/components/tiptap-ui/**/*.ts",
      "src/hooks/use-composed-ref.ts",
      "src/hooks/use-element-rect.ts",
      "src/hooks/use-is-breakpoint.ts",
      "src/hooks/use-menu-navigation.ts",
      "src/hooks/use-unmount.ts",
    ],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

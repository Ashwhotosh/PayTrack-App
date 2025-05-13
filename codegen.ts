// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // Your running GraphQL backend endpoint
  schema: process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  // Path to your files containing GraphQL operations (queries, mutations)
  documents: "graphql/*.ts", // Or "**/*.gql", or ["src/**/*.tsx", "src/**/*.ts"] if using gql tags
  generates: {
    // Output path for the generated types
    "graphql/generated/graphql.tsx": { // Using .tsx for React Apollo hooks
      plugins: [
        "typescript", // Generates base TypeScript types
        "typescript-operations", // Generates types for your operations
        "typescript-react-apollo" // Generates typed React Apollo hooks
      ],
      config: {
        withHooks: true, // Generate React Hooks
        withHOC: false, // We don't need Higher Order Components
        withComponent: false, // We don't need React Components
        apolloReactHooksImportFrom: '@apollo/client', // Ensure it imports from @apollo/client
        // Optional: if you want to prefix generated types/hooks
        // typesPrefix: 'Gql',
        // Dedupe fragments: if you use fragments extensively
        // dedupeFragments: true,
        // Optional: if your enums in Prisma/GraphQL don't exactly match,
        // you might need an enum mapper, but usually not needed if schema is consistent.
        // enumsAsTypes: true, // Generates string literal types for enums instead of TS enums
                              // This can sometimes be easier to work with.
      },
    },
    // Optional: Generate a schema.graphql or schema.json for reference or other tools
    // "./graphql.schema.json": {
    //   plugins: ["introspection"]
    // }
  },
  hooks: {
    // Optional: Run a command after generation, e.g., Prettier
    // afterAllFileWrite: ["prettier --write"]
  }
};

export default config;
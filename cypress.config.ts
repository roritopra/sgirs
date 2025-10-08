import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    video: false,
    screenshotOnRunFailure: true,
    retries: 1,
    setupNodeEvents(on, config) {
      return config;
    },
  },
  viewportWidth: 1366,
  viewportHeight: 768,
});

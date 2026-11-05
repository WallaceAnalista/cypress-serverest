const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportPageTitle: 'ServeRest · Relatório de testes',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  retries: { runMode: 2, openMode: 0 },
  viewportWidth: 1366,
  viewportHeight: 768,
  defaultCommandTimeout: 10000,
  video: false,
  env: {
    apiUrl: 'https://serverest.dev',
  },
  e2e: {
    baseUrl: 'https://front.serverest.dev',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
  },
});
